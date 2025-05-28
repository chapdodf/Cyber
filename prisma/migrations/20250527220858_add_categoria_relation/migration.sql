-- AlterTable
ALTER TABLE `produto` ADD COLUMN `categoriaId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Produto_categoriaId_fkey` ON `produto`(`categoriaId`);

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `Produto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
