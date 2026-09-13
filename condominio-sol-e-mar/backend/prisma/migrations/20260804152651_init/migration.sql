-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MORADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apartment" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "bloco" TEXT,
    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Morador" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "telefone" TEXT,
    "apartamentoId" INTEGER,
    CONSTRAINT "Morador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "quartos" INTEGER NOT NULL,
    "banheiros" INTEGER NOT NULL,
    "vagas" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "proprietario" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "imovelId" INTEGER,
    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reclamacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "apartamento" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Reclamacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaFinanceira" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    CONSTRAINT "CategoriaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lancamento" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoriaId" INTEGER,
    "valor" DOUBLE PRECISION NOT NULL,
    "anexoId" INTEGER,
    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundoReserva" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundoReserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Lancamento_anexoId_key" ON "Lancamento"("anexoId");

-- AddForeignKey
ALTER TABLE "Morador" ADD CONSTRAINT "Morador_apartamentoId_fkey" FOREIGN KEY ("apartamentoId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_anexoId_fkey" FOREIGN KEY ("anexoId") REFERENCES "Anexo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
