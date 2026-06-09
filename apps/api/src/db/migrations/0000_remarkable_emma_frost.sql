CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(30) NOT NULL,
	"password" varchar(255) NOT NULL,
	"bio" varchar(160),
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"last_online_at" timestamp (3) with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
