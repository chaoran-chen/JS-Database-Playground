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
goog.require('jdp.proc.OrderStep');
goog.require('jdp.proc.ChiStep');
goog.require('jdp.proc.arithmetic.Operator');
goog.require('jdp.proc.arithmetic.Type');

var tpch,
  schema, n, r, p, s, ps, o, l,
  tpchQ1, tpchQ3, tpchQ5, tpchQ6, tpchQ10;


var printResult = function (result) {
  console.log(result.code);
  console.log('Code generation time: ' + result.codeGenerationTime + 'ms.');
  console.log('Execution time: ' + result.executionTime + 'ms.');
  console.log(result.results);
};

jdp.tpch.create(0.01).then(function (t) {
  tpch = t;
  schema = tpch.store.generateSchema();
  n = schema.nation;
  r = schema.region;
  p = schema.part;
  s = schema.supplier;
  ps = schema.partsupp;
  c = schema.customer;
  o = schema.orders;
  l = schema.lineitem;

  tpchQ1 = new jdp.Query(tpch.store, new jdp.proc.OrderStep(
    new jdp.proc.ChiStep(
      new jdp.proc.GroupStep(
        new jdp.proc.ChiStep(
          new jdp.proc.SelectionStep(new jdp.proc.ScanStep('lineitem', [
              l.l_quantity,
              l.l_extendedprice,
              l.l_discount,
              l.l_tax,
              l.l_returnflag,
              l.l_linestatus,
              l.l_shipdate
            ]),
            new jdp.pred.Comparison(
              jdp.pred.comparison.Type.LT,
              jdp.utils.codeGen.identifier('lineitem___l_shipdate'),
              jdp.utils.codeGen.literal(new Date('1998-12-01').getTime())
            )
          ),
          [
            {
              alias: 'disc_price_calc',
              arithmetic: new jdp.proc.arithmetic.Operator(
                jdp.proc.arithmetic.Type.MULTIPLICATION, l.l_extendedprice, new jdp.proc.arithmetic.Operator(
                  jdp.proc.arithmetic.Type.SUBTRACTION, 1, l.l_discount
                )
              )
            },
            {
              alias: 'charge_calc',
              arithmetic: new jdp.proc.arithmetic.Operator(
                jdp.proc.arithmetic.Type.MULTIPLICATION, new jdp.proc.arithmetic.Operator(
                  jdp.proc.arithmetic.Type.MULTIPLICATION, l.l_extendedprice, new jdp.proc.arithmetic.Operator(
                    jdp.proc.arithmetic.Type.SUBTRACTION, 1, l.l_discount
                  )
                ), new jdp.proc.arithmetic.Operator(
                  jdp.proc.arithmetic.Type.ADDITION, 1, l.l_tax
                )
              )
            }
          ]
        ), [l.l_returnflag, l.l_linestatus],
        [
          new jdp.proc.SumAggregation('sum_qty', l.l_quantity),
          new jdp.proc.SumAggregation('sum_base_price', l.l_extendedprice),
          new jdp.proc.SumAggregation('sum_disc_price', new jdp.ColumnDefinition('disc_price_calc', lf.Type.NUMBER)),
          new jdp.proc.SumAggregation('sum_charge', new jdp.ColumnDefinition('charge_calc', lf.Type.NUMBER)),
          new jdp.proc.SumAggregation('sum_disc', l.l_discount),
          new jdp.proc.CountAggregation('count_order')
        ]
      ),
      [
        {
          alias: 'avg_qty',
          arithmetic: new jdp.proc.arithmetic.Operator(
            jdp.proc.arithmetic.Type.DIVISION,
            new jdp.ColumnDefinition('sum_qty', lf.Type.NUMBER),
            new jdp.ColumnDefinition('count_order', lf.Type.NUMBER)
          )
        },
        {
          alias: 'avg_price',
          arithmetic: new jdp.proc.arithmetic.Operator(
            jdp.proc.arithmetic.Type.DIVISION,
            new jdp.ColumnDefinition('sum_base_price', lf.Type.NUMBER),
            new jdp.ColumnDefinition('count_order', lf.Type.NUMBER)
          )
        },
        {
          alias: 'avg_disc',
          arithmetic: new jdp.proc.arithmetic.Operator(
            jdp.proc.arithmetic.Type.DIVISION,
            new jdp.ColumnDefinition('sum_disc', lf.Type.NUMBER),
            new jdp.ColumnDefinition('count_order', lf.Type.NUMBER)
          )
        }
      ]
    ),
    [
      {column: l.l_returnflag, order: lf.Order.ASC},
      {column: l.l_linestatus, order: lf.Order.ASC}
    ]
  ));
  // tpchQ1.exec();

  tpchQ3 = new jdp.Query(tpch.store, new jdp.proc.OrderStep(
    new jdp.proc.GroupStep(
      new jdp.proc.ChiStep(
        new jdp.proc.EquiJoinStep(
          new jdp.proc.EquiJoinStep(
            new jdp.proc.SelectionStep(
              new jdp.proc.ScanStep('customer', [c.c_mktsegment, c.c_custkey]),
              new jdp.pred.Comparison(jdp.pred.comparison.Type.EQ,
                jdp.utils.codeGen.identifier('customer___c_mktsegment'),
                jdp.utils.codeGen.literal('BUILDING')
              )
            ),
            new jdp.proc.SelectionStep(
              new jdp.proc.ScanStep('orders', [o.o_orderdate, o.o_custkey, o.o_orderkey, o.o_shippriority]),
              new jdp.pred.Comparison(jdp.pred.comparison.Type.LT,
                jdp.utils.codeGen.identifier('orders___o_orderdate'),
                jdp.utils.codeGen.literal(new Date('1995-03-15').getTime())
              )
            ),
            [{left: c.c_custkey, right: o.o_custkey}]
          ),
          new jdp.proc.SelectionStep(
            new jdp.proc.ScanStep('lineitem', [l.l_orderkey, l.l_extendedprice, l.l_discount, l.l_shipdate]),
            new jdp.pred.Comparison(jdp.pred.comparison.Type.GT,
              jdp.utils.codeGen.identifier('lineitem___l_shipdate'),
              jdp.utils.codeGen.literal(new Date('1995-03-15').getTime())
            )
          ),
          [{left: o.o_orderkey, right: l.l_orderkey}]
        ),
        [
          {
            alias: 'revenue_calc',
            arithmetic: new jdp.proc.arithmetic.Operator(jdp.proc.arithmetic.Type.MULTIPLICATION,
              l.l_extendedprice, new jdp.proc.arithmetic.Operator(jdp.proc.arithmetic.Type.SUBTRACTION,
                1, l.l_discount)
            )
          }
        ]
      ),
      [l.l_orderkey, o.o_orderdate, o.o_shippriority],
      [
        new jdp.proc.SumAggregation('revenue', new jdp.ColumnDefinition('revenue_calc', lf.Type.NUMBER))
      ]
    ),
    [
      {column: new jdp.ColumnDefinition('revenue', lf.Type.NUMBER), order: lf.Order.DESC},
      {column: o.o_orderdate, order: lf.Order.ASC}
    ]
  ));
  // tpchQ3.exec({limit: 10});

  tpchQ5 = new jdp.Query(tpch.store, new jdp.proc.OrderStep(
    new jdp.proc.GroupStep(
      new jdp.proc.ChiStep(
        new jdp.proc.EquiJoinStep(
          new jdp.proc.ScanStep('supplier', [s.s_suppkey, s.s_nationkey]),
          new jdp.proc.EquiJoinStep(
            new jdp.proc.EquiJoinStep(
              new jdp.proc.EquiJoinStep(
                new jdp.proc.EquiJoinStep(
                  new jdp.proc.SelectionStep(
                    new jdp.proc.ScanStep('region', [r.r_name, r.r_regionkey]),
                    new jdp.pred.Comparison(jdp.pred.comparison.Type.EQ,
                      jdp.utils.codeGen.identifier('region___r_name'),
                      jdp.utils.codeGen.literal('ASIA'))
                  ),
                  new jdp.proc.ScanStep('nation', [n.n_name, n.n_regionkey, n.n_nationkey]),
                  [{left: r.r_regionkey, right: n.n_regionkey}]
                ),
                new jdp.proc.ScanStep('customer', [c.c_nationkey, c.c_custkey]),
                [{left: n.n_nationkey, right: c.c_nationkey}]
              ),
              new jdp.proc.SelectionStep(
                new jdp.proc.ScanStep('orders', [o.o_custkey, o.o_orderkey, o.o_orderdate]),
                new jdp.pred.Connection(jdp.pred.connection.Type.AND,
                  new jdp.pred.Comparison(jdp.pred.comparison.Type.GTE,
                    jdp.utils.codeGen.identifier('orders___o_orderdate'),
                    jdp.utils.codeGen.literal(new Date('1994-01-01').getTime())
                  ),
                  new jdp.pred.Comparison(jdp.pred.comparison.Type.LT,
                    jdp.utils.codeGen.identifier('orders___o_orderdate'),
                    jdp.utils.codeGen.literal(new Date('1995-01-01').getTime()))
                )
              ),
              [{left: c.c_custkey, right: o.o_custkey}]
            ),
            new jdp.proc.ScanStep('lineitem', [l.l_orderkey, l.l_extendedprice, l.l_discount, l.l_suppkey]),
            [{left: o.o_orderkey, right: l.l_orderkey}]
          ),
          [
            {left: s.s_suppkey, right: l.l_suppkey},
            {left: s.s_nationkey, right: c.c_nationkey},
            {left: s.s_nationkey, right: n.n_nationkey}
          ]
        ),
        [
          {
            alias: 'revenue_calc',
            arithmetic: new jdp.proc.arithmetic.Operator(
              jdp.proc.arithmetic.Type.MULTIPLICATION, l.l_extendedprice, new jdp.proc.arithmetic.Operator(
                jdp.proc.arithmetic.Type.SUBTRACTION, 1, l.l_discount
              )
            )
          }
        ]
      ),
      [n.n_name],
      [
        new jdp.proc.SumAggregation('revenue', new jdp.ColumnDefinition('revenue_calc', lf.Type.NUMBER))
      ]
    ),
    [
      {column: new jdp.ColumnDefinition('revenue', lf.Type.NUMBER), order: lf.Order.DESC}
    ]
  ));
  // tpchQ5.exec();

  tpchQ6 = new jdp.Query(tpch.store, new jdp.proc.GroupStep(
    new jdp.proc.ChiStep(
      new jdp.proc.SelectionStep(
        new jdp.proc.ScanStep('lineitem', [l.l_extendedprice, l.l_discount, l.l_shipdate, l.l_quantity]),
        new jdp.pred.Connection(jdp.pred.connection.Type.AND,
          new jdp.pred.Connection(jdp.pred.connection.Type.AND,
            new jdp.pred.Connection(jdp.pred.connection.Type.AND,
              new jdp.pred.Connection(jdp.pred.connection.Type.AND,
                new jdp.pred.Comparison(jdp.pred.comparison.Type.GTE,
                  jdp.utils.codeGen.identifier('lineitem___l_shipdate'),
                  jdp.utils.codeGen.literal(new Date('1994-01-01').getTime())
                ),
                new jdp.pred.Comparison(jdp.pred.comparison.Type.LT,
                  jdp.utils.codeGen.identifier('lineitem___l_shipdate'),
                  jdp.utils.codeGen.literal(new Date('1995-01-01').getTime())
                )
              ),
              new jdp.pred.Comparison(jdp.pred.comparison.Type.GTE,
                jdp.utils.codeGen.identifier('lineitem___l_discount'),
                jdp.utils.codeGen.literal(0.05)
              )
            ),
            new jdp.pred.Comparison(jdp.pred.comparison.Type.LTE,
              jdp.utils.codeGen.identifier('lineitem___l_discount'),
              jdp.utils.codeGen.literal(0.07)
            )
          ),
          new jdp.pred.Comparison(jdp.pred.comparison.Type.LT,
            jdp.utils.codeGen.identifier('lineitem___l_quantity'),
            jdp.utils.codeGen.literal(24)
          )
        )
      ),
      [
        {
          alias: 'revenue_calc',
          arithmetic: new jdp.proc.arithmetic.Operator(
            jdp.proc.arithmetic.Type.MULTIPLICATION, l.l_extendedprice, l.l_discount
          )
        }
      ]
    ),
    [],
    [new jdp.proc.SumAggregation('revenue', new jdp.ColumnDefinition('revenue_calc', lf.Type.NUMBER))]
  ));
  // tpchQ6.exec();

  tpchQ10 = new jdp.Query(tpch.store, new jdp.proc.OrderStep(
    new jdp.proc.GroupStep(
      new jdp.proc.ChiStep(
        new jdp.proc.EquiJoinStep(
          new jdp.proc.EquiJoinStep(
            new jdp.proc.ScanStep('nation', [n.n_name, n.n_nationkey]),
            new jdp.proc.EquiJoinStep(
              new jdp.proc.ScanStep('customer', [c.c_custkey, c.c_name, c.c_acctbal, c.c_address, c.c_phone, c.c_comment,
                c.c_nationkey]),
              new jdp.proc.SelectionStep(
                new jdp.proc.ScanStep('orders', [o.o_orderdate, o.o_orderkey, o.o_custkey]),
                new jdp.pred.Connection(jdp.pred.connection.Type.AND,
                  new jdp.pred.Comparison(jdp.pred.comparison.Type.GTE,
                    jdp.utils.codeGen.identifier('orders___o_orderdate'),
                    jdp.utils.codeGen.literal(new Date('1993-10-01').getTime())
                  ),
                  new jdp.pred.Comparison(jdp.pred.comparison.Type.LT,
                    jdp.utils.codeGen.identifier('orders___o_orderdate'),
                    jdp.utils.codeGen.literal(new Date('1994-01-01').getTime())
                  )
                )
              ),
              [{left: c.c_custkey, right: o.o_custkey}]
            ),
            [{left: n.n_nationkey, right: c.c_nationkey}]
          ),
          new jdp.proc.SelectionStep(
            new jdp.proc.ScanStep('lineitem', [l.l_extendedprice, l.l_discount, l.l_orderkey, l.l_returnflag]),
            new jdp.pred.Comparison(jdp.pred.comparison.Type.EQ,
              jdp.utils.codeGen.identifier('lineitem___l_returnflag'),
              jdp.utils.codeGen.literal('R')
            )
          ),
          [{left: o.o_orderkey, right: l.l_orderkey}]
        ),
        [
          {
            alias: 'revenue_calc',
            arithmetic: new jdp.proc.arithmetic.Operator(jdp.proc.arithmetic.Type.MULTIPLICATION,
              l.l_extendedprice, new jdp.proc.arithmetic.Operator(jdp.proc.arithmetic.Type.SUBTRACTION,
                1, l.l_discount
              )
            )
          }
        ]
      ),
      [
        c.c_custkey,
        c.c_name,
        c.c_acctbal,
        c.c_phone,
        n.n_name,
        c.c_address,
        c.c_comment
      ],
      [
        new jdp.proc.SumAggregation('revenue', new jdp.ColumnDefinition('revenue_calc', lf.Type.NUMBER))
      ]
    ),
    [
      {column: new jdp.ColumnDefinition('revenue', lf.Type.NUMBER), order: lf.Order.DESC}
    ]
  ));
  // tpchQ10.exec({limit: 20});
});

// printResult(query.exec());
