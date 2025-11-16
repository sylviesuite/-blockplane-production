CREATE TABLE `conversationRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`materialId` int NOT NULL,
	`rank` int NOT NULL,
	`carbonSavings` decimal(10,2),
	`costDifference` decimal(10,2),
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversationRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` text,
	`query` text NOT NULL,
	`region` varchar(64) DEFAULT 'national',
	`projectArea` int DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
