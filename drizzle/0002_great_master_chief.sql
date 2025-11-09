CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('ai_suggestion_shown','ai_recommendation_accepted','material_substitution','ai_conversation','material_viewed') NOT NULL,
	`sessionId` text NOT NULL,
	`userId` text,
	`materialId` text,
	`materialName` text,
	`alternativeMaterialId` text,
	`alternativeMaterialName` text,
	`carbonSaved` decimal(10,2),
	`costDelta` decimal(10,2),
	`risDelta` int,
	`context` text,
	`source` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
