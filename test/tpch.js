goog.provide('jdp.tpch');
goog.provide('jdp.Tpch_');

goog.require('jdp.Store');
goog.require('jdp.ColumnDefinition');
goog.require('lf.structs.map');
goog.require('lf.Type');


jdp.tpch.create = function (scale) {
  if (scale === undefined) {
    scale = 1;
  }
  return new Promise(function (resolve, reject) {
    var tpch = new jdp.Tpch_(scale);
    tpch.buildSchema_();
    tpch.fillStore_().then(function () {
      console.log('All TPCH data loaded.');
      resolve(tpch);
    })
  });
};


jdp.Tpch_ = function (scale) {
  /** @type number */
  this.scale_ = scale;
  /** @type jdp.Store */
  this.store = new jdp.Store();
};

jdp.Tpch_.prototype.buildSchema_ = function () {
  this.store.createTable('nation', [
    new jdp.ColumnDefinition('n_nationkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('n_name', lf.Type.STRING),
    new jdp.ColumnDefinition('n_regionkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('n_comment', lf.Type.STRING)
  ], jdp.tpch.getTableLength('nation', this.scale_));

  this.store.createTable('region', [
    new jdp.ColumnDefinition('r_regionkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('r_name', lf.Type.STRING),
    new jdp.ColumnDefinition('r_comment', lf.Type.STRING)
  ], jdp.tpch.getTableLength('region', this.scale_));

  this.store.createTable('part', [
    new jdp.ColumnDefinition('p_partkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('p_name', lf.Type.STRING),
    new jdp.ColumnDefinition('p_mfgr', lf.Type.STRING),
    new jdp.ColumnDefinition('p_brand', lf.Type.STRING),
    new jdp.ColumnDefinition('p_type', lf.Type.STRING),
    new jdp.ColumnDefinition('p_size', lf.Type.INTEGER),
    new jdp.ColumnDefinition('p_container', lf.Type.STRING),
    new jdp.ColumnDefinition('p_retailprice', lf.Type.NUMBER),
    new jdp.ColumnDefinition('p_comment', lf.Type.STRING)
  ], 1000 + jdp.tpch.getTableLength('part', this.scale_));

  this.store.createTable('supplier', [
    new jdp.ColumnDefinition('s_suppkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('s_name', lf.Type.STRING),
    new jdp.ColumnDefinition('s_address', lf.Type.STRING),
    new jdp.ColumnDefinition('s_nationkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('s_phone', lf.Type.STRING),
    new jdp.ColumnDefinition('s_acctbal', lf.Type.NUMBER),
    new jdp.ColumnDefinition('s_comment', lf.Type.STRING)
  ], 1000 + jdp.tpch.getTableLength('supplier', this.scale_));

  this.store.createTable('partsupp', [
    new jdp.ColumnDefinition('ps_partkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('ps_suppkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('ps_availqty', lf.Type.INTEGER),
    new jdp.ColumnDefinition('ps_supplycost', lf.Type.NUMBER),
    new jdp.ColumnDefinition('ps_comment', lf.Type.STRING)
  ], 1000 + jdp.tpch.getTableLength('partsupp', this.scale_));

  this.store.createTable('customer', [
    new jdp.ColumnDefinition('c_custkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('c_name', lf.Type.STRING),
    new jdp.ColumnDefinition('c_address', lf.Type.STRING),
    new jdp.ColumnDefinition('c_nationkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('c_phone', lf.Type.STRING),
    new jdp.ColumnDefinition('c_acctbal', lf.Type.NUMBER),
    new jdp.ColumnDefinition('c_mktsegment', lf.Type.STRING),
    new jdp.ColumnDefinition('c_comment', lf.Type.STRING)
  ], 1000 + jdp.tpch.getTableLength('customer', this.scale_));

  this.store.createTable('orders', [
    new jdp.ColumnDefinition('o_orderkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('o_custkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('o_orderstatus', lf.Type.STRING),
    new jdp.ColumnDefinition('o_totalprice', lf.Type.NUMBER),
    new jdp.ColumnDefinition('o_orderdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('o_orderpriority', lf.Type.STRING),
    new jdp.ColumnDefinition('o_clerk', lf.Type.STRING),
    new jdp.ColumnDefinition('o_shippriority', lf.Type.INTEGER),
    new jdp.ColumnDefinition('o_comment', lf.Type.STRING)
  ], 1000 + jdp.tpch.getTableLength('orders', this.scale_));

  this.store.createTable('lineitem', [
    new jdp.ColumnDefinition('l_orderkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_partkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_suppkey', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_linenumber', lf.Type.INTEGER),
    new jdp.ColumnDefinition('l_quantity', lf.Type.NUMBER),
    new jdp.ColumnDefinition('l_extendedprice', lf.Type.NUMBER),
    new jdp.ColumnDefinition('l_discount', lf.Type.NUMBER),
    new jdp.ColumnDefinition('l_tax', lf.Type.NUMBER),
    new jdp.ColumnDefinition('l_returnflag', lf.Type.STRING),
    new jdp.ColumnDefinition('l_linestatus', lf.Type.STRING),
    new jdp.ColumnDefinition('l_shipdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('l_commitdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('l_receiptdate', lf.Type.DATE_TIME),
    new jdp.ColumnDefinition('l_shipinstruct', lf.Type.STRING),
    new jdp.ColumnDefinition('l_shipmode', lf.Type.STRING),
    new jdp.ColumnDefinition('l_comment', lf.Type.STRING)
  ], 1000 + jdp.tpch.getTableLength('lineitem', this.scale_));
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
        complete: function () {
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
    .set('n_name', 1)
    .set('n_regionkey', 2)
    .set('n_comment', 3);
  regionCMap
    .set('r_regionkey', 0)
    .set('r_name', 1)
    .set('r_comment', 2);
  partCMap
    .set('p_partkey', 0)
    .set('p_name', 1)
    .set('p_mfgr', 2)
    .set('p_brand', 3)
    .set('p_type', 4)
    .set('p_size', 5)
    .set('p_container', 6)
    .set('p_retailprice', 7)
    .set('p_comment', 8);
  supplierCMap
    .set('s_suppkey', 0)
    .set('s_name', 1)
    .set('s_address', 2)
    .set('s_nationkey', 3)
    .set('s_phone', 4)
    .set('s_acctbal', 5)
    .set('s_comment', 6);
  partsuppCMap
    .set('ps_partkey', 0)
    .set('ps_suppkey', 1)
    .set('ps_availqty', 2)
    .set('ps_supplycost', 3)
    .set('ps_comment', 4);
  customerCMap
    .set('c_custkey', 0)
    .set('c_name', 1)
    .set('c_address', 2)
    .set('c_nationkey', 3)
    .set('c_phone', 4)
    .set('c_acctbal', 5)
    .set('c_mktsegment', 6)
    .set('c_comment', 7);
  ordersCMap
    .set('o_orderkey', 0)
    .set('o_custkey', 1)
    .set('o_orderstatus', 2)
    .set('o_totalprice', 3)
    .set('o_orderdate', 4)
    .set('o_orderpriority', 5)
    .set('o_clerk', 6)
    .set('o_shippriority', 7)
    .set('o_comment', 8);
  lineitemCMap
    .set('l_orderkey', 0)
    .set('l_partkey', 1)
    .set('l_suppkey', 2)
    .set('l_linenumber', 3)
    .set('l_quantity', 4)
    .set('l_extendedprice', 5)
    .set('l_discount', 6)
    .set('l_tax', 7)
    .set('l_returnflag', 8)
    .set('l_linestatus', 9)
    .set('l_shipdate', 10)
    .set('l_commitdate', 11)
    .set('l_receiptdate', 12)
    .set('l_shipinstruct', 13)
    .set('l_shipmode', 14)
    .set('l_comment', 15);

  var here = this;
  return new Promise(function (resolve) {
    resolve([
      {url: 'test-data/tpch-' + here.scale_ + '/nation.tbl', tableName: 'nation', columnMap: nationCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/region.tbl', tableName: 'region', columnMap: regionCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/part.tbl', tableName: 'part', columnMap: partCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/supplier.tbl', tableName: 'supplier', columnMap: supplierCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/partsupp.tbl', tableName: 'partsupp', columnMap: partsuppCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/customer.tbl', tableName: 'customer', columnMap: customerCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/orders.tbl', tableName: 'orders', columnMap: ordersCMap},
      {url: 'test-data/tpch-' + here.scale_ + '/lineitem.tbl', tableName: 'lineitem', columnMap: lineitemCMap}
    ]);
  }).bind(this).mapSeries(this.fill_);
};


jdp.tpch.getTableLength = function (tableName, scaleFactor) {
  switch (tableName) {
    case 'nation':
      return 25;
    case 'region':
      return 5;
    case 'part':
      return scaleFactor * 200000;
    case 'supplier':
      return scaleFactor * 10000;
    case 'partsupp':
      return scaleFactor * 800000;
    case 'customer':
      return scaleFactor * 150000;
    case 'orders':
      return scaleFactor * 1500000;
    case 'lineitem':
      return scaleFactor * 6000000;
    default:
      throw new Error('Unknown tablename.');
  }
};
