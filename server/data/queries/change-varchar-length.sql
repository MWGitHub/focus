SELECT atttypmod FROM pg_attribute 
WHERE attrelid = 'users'::regclass 
AND attname = 'password';

UPDATE pg_attribute SET atttypmod = 60+4
WHERE attrelid = 'users'::regclass
AND attname = 'password';