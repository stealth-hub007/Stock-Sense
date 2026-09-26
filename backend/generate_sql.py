import sys
from sqlalchemy import create_mock_engine
from database import Base
import models

def dump_sql(sql, *multiparams, **params):
    print(sql.compile(dialect=engine.dialect))
    print(";")

engine = create_mock_engine('postgresql://', executor=dump_sql)

with open('schema.sql', 'w') as f:
    sys.stdout = f
    Base.metadata.create_all(engine, checkfirst=False)
    sys.stdout = sys.__stdout__
