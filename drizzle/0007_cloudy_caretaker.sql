ALTER TABLE `epdMetadata` ADD `epdUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `epdMetadata` ADD `epdDate` timestamp;--> statement-breakpoint
ALTER TABLE `epdMetadata` ADD `manufacturer` varchar(255);--> statement-breakpoint
ALTER TABLE `epdMetadata` ADD `region` varchar(100);--> statement-breakpoint
ALTER TABLE `epdMetadata` ADD `standard` varchar(100);--> statement-breakpoint
ALTER TABLE `materials` ADD `confidenceLevel` enum('High','Medium','Low','None') DEFAULT 'Medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `materials` ADD `dataQuality` text;--> statement-breakpoint
ALTER TABLE `materials` ADD `lastVerified` timestamp;--> statement-breakpoint
ALTER TABLE `materials` ADD `verificationNotes` text;--> statement-breakpoint
ALTER TABLE `materials` ADD `isRegenerative` int DEFAULT 0 NOT NULL;