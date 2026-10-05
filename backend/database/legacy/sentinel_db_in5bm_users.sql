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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `idUsers` int NOT NULL AUTO_INCREMENT,
  `nombreUsers` varchar(100) NOT NULL,
  `emailUsers` varchar(255) NOT NULL,
  `contrasenaUsers` varchar(255) NOT NULL,
  `rolUsers` varchar(20) DEFAULT NULL,
  `pinemergenciaUsers` varchar(10) DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fotoUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idUsers`),
  UNIQUE KEY `emailUsers` (`emailUsers`),
  KEY `idx_user_email` (`emailUsers`),
  CONSTRAINT `chk_rol` CHECK ((`rolUsers` in (_utf8mb4'ADMIN',_utf8mb4'USER',_utf8mb4'STAFF')))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Luis Ronaldo Valdizón Contreras','admin@sentinel.com','$2a$10$pbqFF85AlblR70wDt5wliectM2ZQmAZ5epYxwzCgKviWO/AwFnEnm','ADMIN','1111','2026-03-25 10:32:25',''),(2,'Ciudadano común y corriente','ciudadano@sentinel.com','$2a$10$f5/HCHs7rh6tyDt01/naKe0/byZaicHWVtrYhDRtBADQwyrVMPjVy','USER','1234','2026-03-25 10:32:25','https://www.cetys.mx/noticias/wp-content/uploads/2024/04/ciudadaniaserbueno.jpg'),(3,'Luis pedro vásquez rodríguez','especialista@sentinel.com','$2a$10$coX0k5oZiTdKZQCbtUthPO9ksN1AeYPxY9Yd5i4dBrVitmnbWmZPe','STAFF','9999','2026-03-25 10:32:25',NULL),(4,'','admin_final@sentinel.com','$2a$10$8.UnVuG9HHgffUDAlk8q6OuVGkqCYAdVqE6S58S1AF0Vkv.6Z6TfS','ADMIN','0000','2026-03-25 10:34:31',NULL),(5,'Luis Ronaldo Valdizón Contreras','test@test.com','$2a$10$KmMQsidfg.x4yLltpls6DeypUlAt0Tog/jLM7UIVA.GO/1S.ESY5O','ADMIN','4444',NULL,''),(8,'Ruso','askndn@sentinel.com','$2a$10$Vabh9YnfYmWG/0yEu2Sv2OF0MdSZmaGNqS9KY5oV6pPjhz84ZDD2K','USER','7777','2026-04-15 09:34:44',NULL),(9,'','user111@sentinel.com','$2a$10$yNXYoVVPUTh3JxTu1oF2AuYGBHWD9aXm/e7HCNtI7ogeyjgXmcrca','USER','0000','2026-04-28 08:58:47',NULL),(10,'ssss','sdddsd@sentinel.com','$2a$10$9TOyL.9Jgp0J8/XXbU0PGu9HNB5GyYH2cr8QElQqPorNKS2CnT3P2','USER','0000','2026-05-12 10:43:47','');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
