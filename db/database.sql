
DROP TABLE IF EXISTS `labs`;
CREATE TABLE IF NOT EXISTS `labs` (
  `id` int(11) NOT NULL,
  `name_pt` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name_es` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description_pt` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `description_en` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `description_es` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `tags` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `duration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `resources` int(11) NOT NULL,
  `target` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `difficulty` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `interaction` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `queue` tinyint(1) NOT NULL DEFAULT '1',
  `tutorial_pt` varchar(3000) COLLATE utf8_unicode_ci NOT NULL,
  `tutorial_en` varchar(3000) COLLATE utf8_unicode_ci NOT NULL,
  `tutorial_es` varchar(3000) COLLATE utf8_unicode_ci NOT NULL,
  `video` varchar(3000) COLLATE utf8_unicode_ci NOT NULL,
  `maintenance` int(11) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `instances`;
CREATE TABLE IF NOT EXISTS `instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lab_id` int(11) NOT NULL,
  `description` varchar(55) NOT NULL,
  `address` varchar(50) NOT NULL,
  `duration` int(11) NOT NULL,
  `queue` tinyint(1) NOT NULL,
  `maintenance` tinyint(1) NOT NULL,
  `client` varchar(255) NOT NULL,
  `js` varchar(50) NOT NULL,
  `pt` varchar(50) NOT NULL,
  `defaulthtml` varchar(255) NOT NULL,
  `en` varchar(255) NOT NULL,
  `es` varchar(255) NOT NULL,
  `css` varchar(50) NOT NULL,
  `secret` varchar(255) NOT NULL,
  PRIMARY KEY (`id`,`lab_id`),
  KEY `lab_id` (`lab_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 ;
