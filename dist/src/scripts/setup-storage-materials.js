"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const BUCKET_NAME = 'materiais-comerciais';
async function setupStorageMaterials() {
    console.log(`🔧 Configurando Supabase Storage para: ${BUCKET_NAME}...\n`);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
        process.exit(1);
    }
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'video/mpeg',
    ];
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError)
            throw listError;
        const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
        if (bucketExists) {
            console.log(`✅ Bucket '${BUCKET_NAME}' já existe! Atualizando configurações...`);
            await supabase.storage.updateBucket(BUCKET_NAME, {
                public: false,
                fileSizeLimit: 104857600,
                allowedMimeTypes,
            });
            console.log(`✅ Bucket '${BUCKET_NAME}' atualizado!`);
        }
        else {
            console.log(`🆕 Criando bucket '${BUCKET_NAME}'...`);
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: false,
                fileSizeLimit: 104857600,
                allowedMimeTypes,
            });
            if (createError)
                throw createError;
            console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso!`);
        }
        console.log('\n🎉 Configuração do bucket de Materiais Comerciais concluída!\n');
        console.log('Tipos de arquivo suportados:');
        allowedMimeTypes.forEach((t) => console.log(`  • ${t}`));
        console.log('\nExecute também: npx prisma migrate dev --name "add_commercial_materials_and_announcements"');
    }
    catch (error) {
        console.error('\n❌ ERRO:', error.message || error);
        process.exit(1);
    }
}
setupStorageMaterials();
//# sourceMappingURL=setup-storage-materials.js.map