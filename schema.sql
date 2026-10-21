CREATE TABLE IF NOT EXISTS "user" (
	"user_id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"email"	TEXT,
	"dob"	TEXT,
	"address"	TEXT,
	"phone"	TEXT,
	"town"	TEXT,
	"password"	TEXT,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "users" (
	"user_id"	INTEGER NOT NULL,
	"full_name"	TEXT NOT NULL,
	"email"	TEXT NOT NULL,
	"dob"	TEXT NOT NULL,
	"address"	TEXT NOT NULL,
	"phone"	TEXT NOT NULL,
	"town"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "emission" (
	"entry_id"	INTEGER NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"date"	TEXT NOT NULL,
	"name"	TEXT,
	"leg_1"	TEXT NOT NULL,
	"leg_2"	TEXT NOT NULL,
	"single_return"	TEXT NOT NULL,
	"class"	INTEGER,
	"total_miles"	REAL NOT NULL,
	"co2"	REAL NOT NULL,
	"mode_of_transport"	TEXT, extra_legs TEXT,
	PRIMARY KEY("entry_id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "user"("user_id")
);
