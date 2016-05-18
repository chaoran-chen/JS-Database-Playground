goog.provide('jdp.main');

goog.require('jdp.Store');
goog.require('jdp.ColumnDefinition');
goog.require('lf.structs.map');
goog.require('lf.Type');
goog.require('jdp.Query');
goog.require('jdp.tpch');
goog.require('jdp.pred.Connection');
goog.require('jdp.pred.connection.Type');
goog.require('jdp.pred.Comparison');
goog.require('jdp.pred.comparison.Type');
goog.require('jdp.pred.Not');
goog.require('jdp.proc.EquiJoinStep');

var tpch, cQuery, sQuery, gQuery;

var cScan = new jdp.proc.ScanStep('customer', [
  new jdp.ColumnDefinition('c_custkey', lf.Type.INTEGER, undefined, 'customer'),
  new jdp.ColumnDefinition('c_nationkey', lf.Type.INTEGER, undefined, 'customer')
]);

var oScan = new jdp.proc.ScanStep('orders', [
  new jdp.ColumnDefinition('o_orderkey', lf.Type.INTEGER, undefined, 'orders'),
  new jdp.ColumnDefinition('o_custkey', lf.Type.INTEGER, undefined, 'orders'),
  new jdp.ColumnDefinition('o_shippriority', lf.Type.INTEGER, undefined, 'orders'),
  new jdp.ColumnDefinition('o_orderdate', lf.Type.DATE_TIME, undefined, 'orders')
]);

var dateSelect = new jdp.proc.SelectionStep(oScan,
  new jdp.pred.Comparison(jdp.pred.comparison.Type.GT, {
    "type": "Identifier",
    "name": "orders___o_orderdate"
  }, {
    "type": "Literal",
    "value": new Date('1998-08-01').getTime()
  })
);

var cSelect = new jdp.proc.SelectionStep(cScan,
  new jdp.pred.Connection(jdp.pred.connection.Type.AND,
    new jdp.pred.Connection(jdp.pred.connection.Type.AND,
      new jdp.pred.Comparison(jdp.pred.comparison.Type.GT, {
        "type": "Identifier",
        "name": "customer___c_nationkey"
      }, {
        "type": "Literal",
        "value": 5
      }),
      new jdp.pred.Comparison(jdp.pred.comparison.Type.LT, {
        "type": "Identifier",
        "name": "customer___c_nationkey"
      }, {
        "type": "Literal",
        "value": 15,
        "raw": "15"
      })
    ),
    new jdp.pred.Not(
      new jdp.pred.Comparison(jdp.pred.comparison.Type.LT, {
        "type": "Identifier",
        "name": "customer___c_custkey"
      }, {
        "type": "Literal",
        "value": 50000,
        "raw": "50000"
      })
    )
  )
);

var coJoin = new jdp.proc.EquiJoinStep(cScan, oScan,
  new jdp.ColumnDefinition('c_custkey', lf.Type.INTEGER, undefined, 'customer'),
  new jdp.ColumnDefinition('o_custkey', lf.Type.INTEGER, undefined, 'orders')
);

var cGroup = new jdp.proc.GroupStep(
  cScan, [new jdp.ColumnDefinition('c_nationkey', lf.Type.INTEGER, undefined, 'customer')],
  [new jdp.proc.CountAggregation('nation_count')]
);

var printResult = function (result) {
  console.log(result.code);
  console.log('Code generation time: ' + result.codeGenerationTime + 'ms.');
  console.log('Execution time: ' + result.executionTime + 'ms.');
  console.log(result.results);
};

jdp.tpch.create().then(function (t) {
  tpch = t;

  /**
   * SELECT c_custkey, c_nationkey
   * FROM customer
   *
   * Generated code:
   * var p_table, p_i, p_col_c_custkey, customer___c_custkey, p_col_c_nationkey, customer___c_nationkey, value;
   * p_table = this.store.getTables().get('customer');
   * p_col_c_custkey = p_table.getColumns().get('c_custkey');
   * p_col_c_nationkey = p_table.getColumns().get('c_nationkey');
   * for (p_i = 0; p_i < p_table.size(); p_i++) {
   *   customer___c_custkey = p_col_c_custkey.get(p_i);
   *   customer___c_nationkey = p_col_c_nationkey.get(p_i);
   *   this.results.push({
   *     customer___c_custkey: customer___c_custkey,
   *     customer___c_nationkey: customer___c_nationkey
   *   });
   * }
   *
   * Chrome:
   *   Code generation time: 9ms.
   *   Execution time: 271ms.
   * Firefox:
   *   Code generation time: 5ms.
   *   Execution time: 81ms
   */
  cQuery = new jdp.Query(tpch.store, cScan);

  /**
   * SELECT c_custkey, c_nationkey
   * FROM customer
   * WHERE c_nationkey > 5
   * AND c_nationkey < 15
   * AND NOT(c_custkey < 50000)
   *
   * Generated code:
   * var pp_table, pp_i, pp_col_c_custkey, customer___c_custkey, pp_col_c_nationkey, customer___c_nationkey, value;
   * pp_table = this.store.getTables().get('customer');
   * pp_col_c_custkey = pp_table.getColumns().get('c_custkey');
   * pp_col_c_nationkey = pp_table.getColumns().get('c_nationkey');
   * for (pp_i = 0; pp_i < pp_table.size(); pp_i++) {
   *   customer___c_custkey = pp_col_c_custkey.get(pp_i);
   *   customer___c_nationkey = pp_col_c_nationkey.get(pp_i);
   *   if (customer___c_nationkey > 5 && customer___c_nationkey < 15 && !(customer___c_custkey < 50000)) {
   *     this.results.push({
   *       customer___c_custkey: customer___c_custkey,
   *       customer___c_nationkey: customer___c_nationkey
   *    });
   *   }
   * }
   *
   * Chrome:
   *   Code generation time: 11ms.
   *   Execution time: 242ms.
   * Firefox:
   *   Code generation time: 4ms.
   *   Execution time: 49ms.
   */
  sQuery = new jdp.Query(tpch.store, cSelect);

  /**
   * SELECT c_nationkey, count(*)
   * FROM customer
   * group by c_nationkey
   *
   * Generated code:
   * var pp_table, pp_i, pp_col_c_custkey, customer___c_custkey, pp_col_c_nationkey, customer___c_nationkey, p_map,
   *  p_key, p_group, p_i, p_values, nation_count, value;
   * p_map = lf.structs.map.create();
   * pp_table = this.store.getTables().get('customer');
   * pp_col_c_custkey = pp_table.getColumns().get('c_custkey');
   * pp_col_c_nationkey = pp_table.getColumns().get('c_nationkey');
   * for (pp_i = 0; pp_i < pp_table.size(); pp_i++) {
   *   customer___c_custkey = pp_col_c_custkey.get(pp_i);
   *   customer___c_nationkey = pp_col_c_nationkey.get(pp_i);
   *   p_key = '' + customer___c_nationkey;
   *   if (!p_map.get(p_key)) {
   *     p_map.set(p_key, {});
   *   }
   *   p_group = p_map.get(p_key);
   *   if (p_group.nation_count !== undefined) {
   *     p_group.nation_count = p_group.nation_count + 1;
   *   } else {
   *     p_group.nation_count = 1;
   *   }
   * }
   * p_map.forEach(function (value, key) {
   *   p_values = key.split('+++');
   *   customer___c_nationkey = p_values[0];
   *   nation_count = p_values[1];
   *   nation_count = value.nation_count;
   *   this.results.push({
   *     customer___c_nationkey: customer___c_nationkey,
   *     nation_count: nation_count
   *   });
   * }, this);
   *
   * Chrome:
   *   Code generation time: 7ms.
   *   Execution time: 405ms.
   * Firefox:
   *   Code generation time: 8ms.
   *   Execution time: 95ms.
   */
  gQuery = new jdp.Query(tpch.store, cGroup);

  /**
   * SELECT c_custkey, c_nationkey, o_orderkey, o_custkey, o_shippriority, o_orderdate
   * FROM customer, orders
   * WHERE c_custkey = o_custkey
   *
   * Generated code:
   * var pl_table, pl_i, pl_col_c_custkey, customer___c_custkey, pl_col_c_nationkey, customer___c_nationkey, pr_table,
   *  pr_i, pr_col_o_orderkey, orders___o_orderkey, pr_col_o_custkey, orders___o_custkey, pr_col_o_shippriority,
   *  orders___o_shippriority, pr_col_o_orderdate, orders___o_orderdate, p_map, value;
   * p_map = lf.structs.map.create();
   * pl_table = this.store.getTables().get('customer');
   * pl_col_c_custkey = pl_table.getColumns().get('c_custkey');
   * pl_col_c_nationkey = pl_table.getColumns().get('c_nationkey');
   * for (pl_i = 0; pl_i < pl_table.size(); pl_i++) {
   *   customer___c_custkey = pl_col_c_custkey.get(pl_i);
   *   customer___c_nationkey = pl_col_c_nationkey.get(pl_i);
   *   p_map.set(customer___c_custkey, {
   *     customer___c_custkey: customer___c_custkey,
   *     customer___c_nationkey: customer___c_nationkey
   *   });
   * }
   * pr_table = this.store.getTables().get('orders');
   * pr_col_o_orderkey = pr_table.getColumns().get('o_orderkey');
   * pr_col_o_custkey = pr_table.getColumns().get('o_custkey');
   * pr_col_o_shippriority = pr_table.getColumns().get('o_shippriority');
   * pr_col_o_orderdate = pr_table.getColumns().get('o_orderdate');
   * for (pr_i = 0; pr_i < pr_table.size(); pr_i++) {
   *   orders___o_orderkey = pr_col_o_orderkey.get(pr_i);
   *   orders___o_custkey = pr_col_o_custkey.get(pr_i);
   *   orders___o_shippriority = pr_col_o_shippriority.get(pr_i);
   *   orders___o_orderdate = pr_col_o_orderdate.get(pr_i);
   *   p_leftTuple = p_map.get(orders___o_custkey);
   *   if (p_leftTuple !== undefined) {
   *     customer___c_custkey = p_leftTuple.customer___c_custkey;
   *     customer___c_nationkey = p_leftTuple.customer___c_nationkey;
   *     this.results.push({
   *       customer___c_custkey: customer___c_custkey,
   *       customer___c_nationkey: customer___c_nationkey,
   *       orders___o_orderkey: orders___o_orderkey,
   *       orders___o_custkey: orders___o_custkey,
   *       orders___o_shippriority: orders___o_shippriority,
   *       orders___o_orderdate: new Date(orders___o_orderdate)
   *     });
   *   }
   * }
   *
   * Chrome:
   *   Code generation time: 3ms.
   *   Execution time: 11601ms.
   * Firefox:
   *   Code generation time: 6ms.
   *   Execution time: 2586ms.
   */
  jQuery = new jdp.Query(tpch.store, coJoin);
});

// printResult(cQuery.exec());

