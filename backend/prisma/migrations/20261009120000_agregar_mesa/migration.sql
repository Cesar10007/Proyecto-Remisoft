-- CreateTable
CREATE TABLE `mesa` (
    `id_mesa` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `capacidad` INTEGER NULL DEFAULT 4,

    UNIQUE INDEX `mesa_numero_key`(`numero`),
    PRIMARY KEY (`id_mesa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Datos iniciales: 12 mesas de ejemplo (ajustables desde la base)
INSERT INTO `mesa` (`numero`, `capacidad`) VALUES
(1, 4), (2, 4), (3, 4), (4, 4), (5, 4), (6, 4),
(7, 4), (8, 4), (9, 4), (10, 4), (11, 4), (12, 4);
