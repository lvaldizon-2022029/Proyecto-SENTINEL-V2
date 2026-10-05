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
-- Table structure for table `despachoemergencias`
--

DROP TABLE IF EXISTS `despachoemergencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `despachoemergencias` (
  `idDespachoEmergencias` int NOT NULL AUTO_INCREMENT,
  `alertaid` int DEFAULT NULL,
  `estacionid` int DEFAULT NULL,
  `unidadidDespachoEmergencias` varchar(255) DEFAULT NULL,
  `fechahoraDespachoEmergencias` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idDespachoEmergencias`),
  KEY `fk_despacho_alerta` (`alertaid`),
  KEY `fk_despacho_estacion` (`estacionid`),
  CONSTRAINT `fk_despacho_alerta` FOREIGN KEY (`alertaid`) REFERENCES `alertas` (`idAlertas`) ON DELETE CASCADE,
  CONSTRAINT `fk_despacho_estacion` FOREIGN KEY (`estacionid`) REFERENCES `estaciones` (`idEstaciones`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `despachoemergencias`
--

LOCK TABLES `despachoemergencias` WRITE;
/*!40000 ALTER TABLE `despachoemergencias` DISABLE KEYS */;
INSERT INTO `despachoemergencias` VALUES (1,NULL,NULL,NULL,NULL),(3,2,2,'AMB-1','2026-04-29 07:51:26'),(5,1,1,'DFG','2026-05-06 08:18:41');
/*!40000 ALTER TABLE `despachoemergencias` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-04 11:28:12
