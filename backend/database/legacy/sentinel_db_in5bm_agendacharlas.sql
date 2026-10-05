CREATE DATABASE  IF NOT EXISTS `sentinel_db_in5bm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sentinel_db_in5bm`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sentinel_db_in5bm
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agendacharlas`
--

DROP TABLE IF EXISTS `agendacharlas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendacharlas` (
  `idAgendaCharlas` int NOT NULL AUTO_INCREMENT,
  `ciudadanoid` int DEFAULT NULL,
  `especialistaid` int DEFAULT NULL,
  `fechahoraAgendaCharlas` datetime NOT NULL,
  `estadoAgendaCharlas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idAgendaCharlas`),
  KEY `fk_agenda_ciudadano` (`ciudadanoid`),
  KEY `fk_agenda_especialista` (`especialistaid`),
  CONSTRAINT `fk_agenda_ciudadano` FOREIGN KEY (`ciudadanoid`) REFERENCES `users` (`idUsers`),
  CONSTRAINT `fk_agenda_especialista` FOREIGN KEY (`especialistaid`) REFERENCES `especialistas` (`userid`),
  CONSTRAINT `chk_estado_charla` CHECK ((`estadoAgendaCharlas` in (_utf8mb4'PROGRAMADA',_utf8mb4'CONFIRMADA',_utf8mb4'REALIZADA',_utf8mb4'CANCELADA')))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendacharlas`
--

LOCK TABLES `agendacharlas` WRITE;
/*!40000 ALTER TABLE `agendacharlas` DISABLE KEYS */;
INSERT INTO `agendacharlas` VALUES (4,1,1,'2026-07-22 20:54:00','PROGRAMADA');
/*!40000 ALTER TABLE `agendacharlas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-04 11:28:11
