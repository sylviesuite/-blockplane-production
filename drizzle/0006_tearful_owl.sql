CREATE TABLE `globalImpact` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`totalCarbonSaved` decimal(12,2) DEFAULT '0',
	`totalSubstitutions` int DEFAULT 0,
	`totalProjectsOptimized` int DEFAULT 0,
	`totalAIRecommendations` int DEFAULT 0,
	`totalAIAcceptances` int DEFAULT 0,
	`topMaterialId` int,
	`topMaterialCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalImpact_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userImpact` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalCarbonSaved` decimal(12,2) DEFAULT '0',
	`totalSubstitutions` int DEFAULT 0,
	`totalProjectsOptimized` int DEFAULT 0,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userImpact_id` PRIMARY KEY(`id`)
);
