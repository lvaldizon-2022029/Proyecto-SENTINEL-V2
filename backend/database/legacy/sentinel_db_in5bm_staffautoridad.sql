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
-- Table structure for table `staffautoridad`
--

DROP TABLE IF EXISTS `staffautoridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffautoridad` (
  `idStaffAutoridad` int NOT NULL AUTO_INCREMENT,
  `estacionid` int DEFAULT NULL,
  `rangoStaffAutoridad` varchar(255) DEFAULT NULL,
  `estatusStaffAutoridad` varchar(255) DEFAULT NULL,
  `userid` int DEFAULT NULL,
  PRIMARY KEY (`idStaffAutoridad`),
  KEY `fk_staff_estacion` (`estacionid`),
  KEY `FKs3kaq18ail4dek25u8k8osr8d` (`userid`),
  CONSTRAINT `fk_staff_estacion` FOREIGN KEY (`estacionid`) REFERENCES `estaciones` (`idEstaciones`),
  CONSTRAINT `FKs3kaq18ail4dek25u8k8osr8d` FOREIGN KEY (`userid`) REFERENCES `users` (`idUsers`),
  CONSTRAINT `chk_estatus_staff` CHECK ((`estatusStaffAutoridad` in (_utf8mb4'ACTIVO',_utf8mb4'INACTIVO',_utf8mb4'VACACIONES')))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffautoridad`
--

LOCK TABLES `staffautoridad` WRITE;
/*!40000 ALTER TABLE `staffautoridad` DISABLE KEYS */;
INSERT INTO `staffautoridad` VALUES (1,1,'Cadete','Activo',NULL),(2,2,'w','Activo',NULL),(14,1,'kkkk','Activo',NULL);
/*!40000 ALTER TABLE `staffautoridad` ENABLE KEYS */;
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
