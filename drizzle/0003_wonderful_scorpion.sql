CREATE TABLE `favoriteMaterials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`materialId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoriteMaterials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `msiPresets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`impactWeight` int NOT NULL,
	`carbonWeight` int NOT NULL,
	`costWeight` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `msiPresets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`bomData` text NOT NULL,
	`totalCarbon` decimal(10,2),
	`totalCost` decimal(10,2),
	`avgRIS` decimal(5,2),
	`avgLIS` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedProjects_id` PRIMARY KEY(`id`)
);
