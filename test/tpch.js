goog.provide('jdp.tpch');
goog.provide('jdp.Tpch_');

goog.require('jdp.Store');
goog.require('jdp.ColumnDefinition');
goog.require('lf.structs.map');
goog.require('lf.Type');


jdp.tpch.create = function () {
  return new Promise(function (resolve, reject) {
    var tpch = new jdp.Tpch_();
    tpch.buildSchema_();
    tpch.fillStore_().then(function () {
      console.log('All TPCH data loaded.');
      resolve(tpch);
    })
  });
};


jdp.Tpch_ = function () {
  /** @type jdp.Store */
  this.store = new jdp.Store();
};

jdp.Tpch_.prototype.buildSchema_ = function () {
  this.store.createTable('nation', [
    new jdp.ColumnDefinition('n_nationkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('n_name', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('n_regionkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('n_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('region', [
    new jdp.ColumnDefinition('r_regionkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('r_name', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('r_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('part', [
    new jdp.ColumnDefinition('p_partkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('p_name', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('p_mfgr', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('p_brand', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('p_type', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('p_size', lf.Type.INTEGER),
    new jdp.ColumnDefinition('p_container', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('p_retailprice', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('p_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('supplier', [
    new jdp.ColumnDefinition('s_suppkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('s_name', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('s_address', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('s_nationkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('s_phone', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('s_acctbal', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('s_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('partsupp', [
    new jdp.ColumnDefinition('ps_partkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('ps_suppkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('ps_availqty', lf.Type.INTEGER),
    new jdp.ColumnDefinition('ps_supplycost', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('ps_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('customer', [
    new jdp.ColumnDefinition('c_custkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('c_name', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('c_address', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('c_nationkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('c_phone', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('c_acctbal', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('c_mktsegment', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('c_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('orders', [
    new jdp.ColumnDefinition('o_orderkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('o_custkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('o_orderstatus', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('o_totalprice', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('o_orderdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('o_orderpriority', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('o_clerk', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('o_shippriority', lf.Type.INTEGER),
    new jdp.ColumnDefinition('o_comment', lf.Type.INTEGER) //TODO
  ]);

  this.store.createTable('lineitem', [
    new jdp.ColumnDefinition('l_orderkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_partkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_suppkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_linenumber', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_quantity', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_extendedprice', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_discount', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_tax', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_returnflag', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_linestatus', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_shipdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('l_commitdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('l_receiptdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('l_shipinstruct', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_shipmode', lf.Type.INTEGER), //TODO
    new jdp.ColumnDefinition('l_comment', lf.Type.INTEGER) //TODO
  ]);
};

jdp.Tpch_.prototype.fill_ = function (dataset) {
  var columnNames = [],
    insert;
  dataset.columnMap.forEach(function (value, key) {
    columnNames.push(key);
  });
  insert = this.store.getTables().get(dataset.tableName).getInserter(columnNames);
  return new Promise(
    function (resolve, reject) {
      console.log('start loading ' + dataset.tableName);
      Papa.parse(dataset.url, {
        delimiter: '|',
        download: true,
        skipEmptyLines: true,
        step: function (row) {
          var args = [];
          dataset.columnMap.forEach(function (value, key) {
            args.push(row.data[0][value]);
          });
          insert.apply(null, args);
        },
        complete: function (results) {
          console.log(dataset.tableName + ' loaded');
          resolve();
        }
      });
    }
  );
};

jdp.Tpch_.prototype.fillStore_ = function () {
  var
    nationCMap = lf.structs.map.create(),
    regionCMap = lf.structs.map.create(),
    partCMap = lf.structs.map.create(),
    supplierCMap = lf.structs.map.create(),
    partsuppCMap = lf.structs.map.create(),
    customerCMap = lf.structs.map.create(),
    ordersCMap = lf.structs.map.create(),
    lineitemCMap = lf.structs.map.create();

  nationCMap
    .set('n_nationkey', 0)
    .set('n_regionkey', 2);
  regionCMap
    .set('r_regionkey', 0);
  partCMap
    .set('p_partkey', 0)
    .set('p_size', 5);
  supplierCMap
    .set('s_suppkey', 0)
    .set('s_nationkey', 3);
  partsuppCMap
    .set('ps_partkey', 0)
    .set('ps_suppkey', 1)
    .set('ps_availqty', 2);
  customerCMap
    .set('c_custkey', 0)
    .set('c_nationkey', 3);
  ordersCMap
    .set('o_orderkey', 0)
    .set('o_custkey', 1)
    .set('o_orderdate', 4)
    .set('o_shippriority', 7);
  lineitemCMap
    .set('l_orderkey', 0)
    .set('l_partkey', 1)
    .set('l_suppkey', 2)
    .set('l_linenumber', 3)
    .set('l_shipdate', 9)
    .set('l_commitdate', 10)
    .set('l_receiptdate', 11);

  return new Promise(function (resolve) {
    resolve([
      {url: 'test-data/tpch-1/nation.tbl', tableName: 'nation', columnMap: nationCMap},
      {url: 'test-data/tpch-1/region.tbl', tableName: 'region', columnMap: regionCMap},
      {url: 'test-data/tpch-1/part.tbl', tableName: 'part', columnMap: partCMap},
      {url: 'test-data/tpch-1/supplier.tbl', tableName: 'supplier', columnMap: supplierCMap},
      {url: 'test-data/tpch-1/partsupp.tbl', tableName: 'partsupp', columnMap: partsuppCMap},
      {url: 'test-data/tpch-1/customer.tbl', tableName: 'customer', columnMap: customerCMap},
      {url: 'test-data/tpch-1/orders.tbl', tableName: 'orders', columnMap: ordersCMap},
      {url: 'test-data/tpch-1/lineitem.tbl', tableName: 'lineitem', columnMap: lineitemCMap}
    ]);
  }).bind(this).mapSeries(this.fill_);
};
