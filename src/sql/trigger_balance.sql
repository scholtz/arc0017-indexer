drop TRIGGER if exists trigger_balance ON transaction;
drop FUNCTION if exists trigger_balance;

CREATE FUNCTION trigger_balance() RETURNS trigger AS $emp_stamp$
declare
  maxRound bigint;
  newBalance bigint;

  BEGIN
    if NEW.type = 4 THEN
      NEW.balance := 0;
    else
      newBalance := 0;
      maxRound := 0;
      select max(round) INTO maxRound FROM transaction where transaction.account = NEW.account and type = 4 and transaction.asset = NEW.asset and transaction.env = NEW.env  and transaction.round < NEW.round ;
      if ( maxRound is null ) then
        maxRound:=0;
      end if;
      select sum(transaction.amount) INTO newBalance from transaction where transaction.account = NEW.account and transaction.asset = NEW.asset and transaction.env = NEW.env and transaction.round > maxRound  and (transaction.round < NEW.round or (transaction.round = NEW.round and transaction.intraround < NEW.intraround));
      if ( newBalance is null ) then
        newBalance:=0;
      end if;
      NEW.balance := newBalance + NEW.amount;
    end if;

    RETURN NEW;
  END;
  
  $emp_stamp$ LANGUAGE plpgsql;

  CREATE TRIGGER trigger_balance BEFORE INSERT OR UPDATE ON transaction
      FOR EACH ROW EXECUTE PROCEDURE trigger_balance();