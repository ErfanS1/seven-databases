
```psql
create database book;
# to list DBs
\list

# to get help, shows all commands.
\h

# to get details of a command
\h create index

CREATE TABLE countries ( country_code char(2) PRIMARY KEY, country_name text UNIQUE );

CREATE TABLE cities ( name text NOT NULL, postal_code varchar(9) CHECK (postal_code <> ''), country_code char(2) REFERENCES countries, PRIMARY KEY (country_code, postal_code) );


# here as you see you can reference two values!
CREATE TABLE venues (
	venue_id SERIAL PRIMARY KEY,
	name varchar(255), street_address text,
	type char(7) CHECK ( type in ('public','private') ) DEFAULT 'public',
	postal_code varchar(9), country_code char(2), FOREIGN KEY (country_code,
	postal_code) REFERENCES cities (country_code, postal_code) MATCH FULL 
);


# create table events
create table events (
 event_id serial primary key,
 title varchar(20),
 starts timestamp,
 ends timestamp,
 v_id integer, foreign key (v_id) references venues(venue_id)
);


# you can insert and tell postgre to return the id or any other field
INSERT INTO venues (name, postal_code, country_code)
VALUES ('Voodoo Donuts', '97205', 'us') RETURNING venue_id;

# talks about left join(left outer join) and join(inner join), right join and full join which is left join union right join.
SELECT e.title, v.name FROM events e LEFT JOIN venues v ON e.venue_id = v.venue_id;


# talks about index
CREATE INDEX events_title ON events USING hash (title);

CREATE INDEX events_starts ON events USING btree (starts);

\di to get all indexes
\di+ with size and desc

# if you use foreign key, postgres will use indexes on targeted columns.

# select * from pg_class; this has some details about tables;

# you can have sub query in inserts as well !

AGGREGATE functoins
min, max

SELECT min(starts), max(ends)
FROM events INNER JOIN venues
ON events.v_id = venues.venue_id
WHERE venues.name = 'Crystal Ballroom';

GROUPING

SELECT venue_id, count(*) FROM events GROUP BY venue_id;
# HAVING is like the WHERE clause from GROUP BY except it can filter by aggregate functions (whereas WHERE cannot).

# SELECT DISTINCT venue_id FROM events; equals SELECT venue_id FROM events GROUP BY venue_id;

#MYSQL: If you tried to run a SELECT with columns not defined under a GROUP BY in MySQL, you may be shocked to see that it works.
```
# Window Functions
```
# (PostgreSQL is one of the few open source databases to implement them)
# if you need a column which is not in the group by columns ! you need to partition them
SELECT title, count(*) OVER (PARTITION BY venue_id) FROM events;

```
# Transactions
```
transactions follow ACID compliance, which stands for Atomic (all ops succeed or none do), Consistent (the data will always be in a good state—no inconsistent states), Isolated (transactions don’t interfere), and Durable (a committed transaction is safe, even after a server crash).

BEGIN TRANSACTION;
	DELETE FROM events;
ROLLBACK;
SELECT * FROM events;

BEGIN TRANSACTION;
	UPDATE account SET total=total+5000.0 WHERE account_id=1337;
	UPDATE account SET total=total-5000.0 WHERE account_id=45887; 
END;
```
# Procedures
```bash
CREATE OR REPLACE FUNCTION add_event( title text, starts timestamp,
ends timestamp, venue text, postal varchar(9), country char(2) )
RETURNS boolean AS $$
DECLARE
	did_insert boolean := false;
	found_count integer;
	the_venue_id integer;
BEGIN
	SELECT venue_id INTO the_venue_id
	FROM venues v
	WHERE v.postal_code=postal AND v.country_code=country AND v.name ILIKE venue
	LIMIT 1;
	IF the_venue_id IS NULL THEN
	INSERT INTO venues (name, postal_code, country_code)
		VALUES (venue, postal, country)
	RETURNING venue_id INTO the_venue_id;
	did_insert := true;
	END IF;
	-- Note: not an “error”, as in some programming languages
	RAISE NOTICE 'Venue found %', the_venue_id;
	INSERT INTO events (title, starts, ends, venue_id)
	VALUES (title, starts, ends, the_venue_id);
	RETURN did_insert;
END;
$$ LANGUAGE plpgsql;

# you can import external file like this
\i add_event.sql 

# how to use it ?
SELECT add_event('House Party', '2012-05-03 23:00', '2012-05-04 02:00', 'Run''s House', '97205', 'us');

# to list all the progamming languanges.
createlang book --list # removed from version 10. this was in the book

# the new commands are `CREATE EXTENSION` and `DROP EXTENSION`


CREATE OR REPLACE FUNCTION log_event() RETURNS trigger AS $$
DECLARE 
BEGIN 
	INSERT INTO logs (event_id, old_title, old_starts, old_ends)
	VALUES (OLD.event_id, OLD.title, OLD.starts, OLD.ends);
	RAISE NOTICE 'Someone just changed event #%', OLD.event_id;
	RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;


# create trigger like this
CREATE TRIGGER log_events
	AFTER UPDATE ON events
	FOR EACH ROW EXECUTE PROCEDURE log_event();

# Triggers can also be created before updates and before or after inserts.
```

# Views
```bash
CREATE VIEW holidays AS
	SELECT event_id AS holiday_id, title AS name, starts AS date
	FROM events 
	WHERE title LIKE '%Day%' AND venue_id IS NULL;

# you can query it like a normal table

# you can update the views like this
CREATE OR REPLACE VIEW holidays AS
	SELECT event_id AS holiday_id, title AS name, starts AS date, colors
	FROM events 
	WHERE title LIKE '%Day%' AND venue_id IS NULL;


UPDATE holidays SET colors = '{"red","green"}' where name = 'Christmas Day'; ERROR: cannot update a view HINT: You need an unconditional ON UPDATE DO INSTEAD rule. # its funny I didnt get any error !!

EXPLAIN VERBOSE SELECT * FROM holidays;

# set rules for update in views
CREATE RULE update_holidays AS ON UPDATE TO holidays DO INSTEAD
	UPDATE events 
	SET title = NEW.name,
		starts = NEW.date, 
		colors = NEW.colors 
	WHERE title = OLD.name;

# we can also have rules for insert in views and deletes 

```

# cross tab
```bash
SELECT extract(year from starts) as year, 
	extract(month from starts) as month, count(*)
	FROM events 
	GROUP BY year, month;

CREATE TEMPORARY TABLE month_count(month INT); INSERT INTO month_count VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12);

SELECT * FROM crosstab( 
	'SELECT extract(year from starts) as year,
		extract(month from starts) as month, count(*)
		FROM events 
		GROUP BY year, month', 
		'SELECT * FROM month_count'
) AS ( year int, jan int, feb int, mar int, apr int, may int, jun int, jul int, aug int, sep int, oct int, nov int, dec int ) ORDER BY YEAR;

# this query didnt work the solution is to first run this.
CREATE EXTENSION IF NOT EXISTS tablefunc;
# This ensures the `tablefunc` extension, which includes the `crosstab` function, is enabled.

```

# Full-Text and Multidimensions
```bash
# to active cube
CREATE EXTENSION IF NOT EXISTS cube;

CREATE TABLE genres ( name text UNIQUE, position integer );
CREATE TABLE movies ( movie_id SERIAL PRIMARY KEY, title text, genre cube );
CREATE TABLE actors ( actor_id SERIAL PRIMARY KEY, name text );

CREATE TABLE movies_actors (
	movie_id integer REFERENCES movies NOT NULL, 
	actor_id integer REFERENCES actors NOT NULL, UNIQUE (movie_id, actor_id) 
); 
CREATE INDEX movies_actors_movie_id ON movies_actors (movie_id);
CREATE INDEX movies_actors_actor_id ON movies_actors (actor_id);
CREATE INDEX movies_genres_cube ON movies USING gist (genre);

SELECT title FROM movies WHERE title ILIKE 'stardust%';

# LIKE and ILIKE(its case insensitive of like)
# _ means exactly one character, % means any numbers of characters

SELECT title FROM movies WHERE title ILIKE 'stardust_%';

# you can use regular expressions POSIX in psql
SELECT COUNT(*) FROM movies WHERE title !~* '^the.*';

CREATE INDEX movies_title_pattern ON movies (lower(title) text_pattern_ops);


# to use next command
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

# this returns distance of 2 words ! :))
SELECT levenshtein('bat', 'fads');

# Nice query
SELECT movie_id, title FROM movies 
	WHERE levenshtein(lower(title), lower('a hard day nght')) <= 3;
# This ensures minor differences won’t over-inflate the distance.


# use this for next command
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX movies_title_trigram ON movies USING gist (title gist_trgm_ops);

SELECT * FROM movies WHERE title % 'Avatre';

# TSVector and TSQuery
SELECT title FROM movies WHERE title @@ 'night & day';

SELECT title FROM movies WHERE to_tsvector(title) @@ to_tsquery('english', 'night & day');

SELECT to_tsvector('simple', 'A Hard Day''s Night');

# to check languages psql supports for nlp
\dF 
\dFd

# to see how many words are in the dictionary
SELECT ts_lexize('english_stem', 'Day''s');

# to create inverted idnex (gin)
CREATE INDEX movies_title_searchable ON movies USING gin(to_tsvector('english', title));

# we need to specify english since its in our index.
EXPLAIN SELECT * FROM movies
	WHERE to_tsvector('english',title) @@ 'night & day';

# metaphone for the sound be almost equal
SELECT title FROM movies NATURAL JOIN movies_actors NATURAL JOIN actors WHERE metaphone(name, 6) = metaphone('Broos Wils', 6);

```

# Cube
```sql
-- in order to get genres from the genres table
SELECT name, cube_ur_coord('(0,7,0,0,0,0,0,0,0,7,0,0,0,0,10,0,0,0)', position) as score FROM genres g WHERE cube_ur_coord('(0,7,0,0,0,0,0,0,0,7,0,0,0,0,10,0,0,0)', position) > 0;


-- cube_distance finds the distance of a row to the given cube. cube here is an 18 dimensional thing
SELECT *, cube_distance(genre, '(0,7,0,0,0,0,0,0,0,7,0,0,0,0,10,0,0,0)') dist FROM movies ORDER BY dist;


-- how to enlarge a cube?
SELECT cube_enlarge('(1,1)',1,2);
-- (0, 0),(2, 2)


-- since finding distance of every cube is slow ! we use another operator to enlarge the cube first and change it to 18 dimensional object and we find only the movies that exist inside of this cube. and its way faster
SELECT title, cube_distance(genre, '(0,7,0,0,0,0,0,0,0,7,0,0,0,0,10,0,0,0)') dist FROM movies WHERE cube_enlarge('(0,7,0,0,0,0,0,0,0,7,0,0,0,0,10,0,0,0)'::cube, 5, 18) @> genre ORDER BY dist;


-- change the query so you can use a movie name and get movies in its expanded cube with 5 points on all the 18 dimensions. 
SELECT m.movie_id, m.title FROM movies m, (SELECT genre, title FROM movies WHERE title = 'Mad Max') s WHERE cube_enlarge(s.genre, 5, 18) @> m.genre AND s.title <> m.title ORDER BY cube_distance(m.genre, s.genre) LIMIT 10;
```