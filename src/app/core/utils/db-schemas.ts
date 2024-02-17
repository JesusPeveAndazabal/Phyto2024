
export const createSchema: string = `
CREATE TABLE IF NOT EXISTS person (
  id integer PRIMARY KEY NOT NULL,
  code TEXT NOT NULL,
  fullname TEXT ,
  document TEXT,
  type integer,
  is_deleted integer
);
CREATE INDEX IF NOT EXISTS person_index_code ON person (code);
CREATE INDEX IF NOT EXISTS person_index_document ON person (document);

CREATE TABLE IF NOT EXISTS work(
  id INTEGER PRIMARY KEY,
  name TEXT,
  cultivation INTEGER,
  cultivation_name TEXT,
  product INTEGER,
  product_name TEXT,
  risk INTEGER,
  risk_name TEXT,
  pressure_tolerance REAL
);

CREATE TABLE IF NOT EXISTS work_execution(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work INTEGER,
  lot INTEGER,
  date TEXT,
  worker INTEGER,
  supervisor INTEGER,
  configuration TEXT,
  working_time TEXT,
  downtime TEXT,
  hectare REAL,
  cultivation INTEGER,
  product INTEGER,
  is_finished INTEGER,
  sended INTEGER
);

CREATE TABLE IF NOT EXISTS water_volumes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_exec_id INTEGER,
  volume REAL
);

CREATE TABLE IF NOT EXISTS lot(
  id INTEGER PRIMARY KEY,
  name TEXT,
  hectare REAL,
  width REAL,
  volume REAL,
  cultivation INTEGER,
  cultivation_name TEXT,
  owner INTEGER,
  farm INTEGER,
  farm_name TEXT
);

CREATE TABLE IF NOT EXISTS nozzle_type (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS nozzle_color(
  id INTEGER PRIMARY KEY,
  code TEXT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS nozzles(
  id INTEGER PRIMARY KEY,
  type INTEGER,
  color INTEGER,
  pressure REAL,
  pressure_unit INTEGER,
  flow REAL
);

CREATE TABLE IF NOT EXISTS cultivation(
  id INTEGER PRIMARY KEY,
  code TEXT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS farm(
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS product(
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS local_conf(
  api_server TEXT,
  vol_alert_on REAL,
  min_wflow REAL,
  max_wflow REAL,
  unit_pressure INTEGER,
  min_pressure REAL,
  max_pressure REAL
);
`;
