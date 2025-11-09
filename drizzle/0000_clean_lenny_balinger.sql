CREATE TABLE `epdMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`source` varchar(255) NOT NULL,
	`referenceYear` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `epdMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lifecycleValues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`phase` enum('Point of Origi') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lifecycleValues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('Timber','Steel','Concrete','Earth') NOT NULL,
	`functionalUnit` varchar(50) NOT NULL,
	`totalCarbon` decimal(10,2) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_id` PRIMARY KEY(`id`),
	CONSTRAINT `materials_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`costPerUnit` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricing_materialId_unique` UNIQUE(`materialId`)
);
--> statement-breakpoint
CREATE TABLE `risScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`risScore` int NOT NULL,
	`lisScore` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `risScores_id` PRIMARY KEY(`id`),
	CONSTRAINT `risScores_materialId_unique` UNIQUE(`materialId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
