"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const BUCKET_NAME = 'avatares-perfil';
async function setupStorageAvatars() {
    console.log(`🔧 Configurando Supabase Storage para: ${BUCKET_NAME}...\n`);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
        process.exit(1);
    }
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError)
            throw listError;
        const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
        if (bucketExists) {
            console.log(`✅ Bucket '${BUCKET_NAME}' já existe! Atualizando configurações...`);
            const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 5242880,
                allowedMimeTypes: [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/webp',
                ],
            });
            if (updateError)
                throw updateError;
            console.log(`✅ Bucket '${BUCKET_NAME}' atualizado com sucesso!`);
        }
        else {
            console.log(`🆕 Criando bucket '${BUCKET_NAME}'...`);
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 5242880,
                allowedMimeTypes: [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/webp',
                ],
            });
            if (createError)
                throw createError;
            console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso!`);
        }
        console.log('\n📁 Estrutura de pastas dentro do bucket:');
        console.log('  avatares-perfil/');
        console.log('    users/         → Fotos de perfil dos usuários (admins)');
        console.log('    representatives/ → Fotos de perfil dos representantes comerciais');
        console.log('\n🎉 Configuração do bucket de avatares concluída com sucesso!');
        console.log('\n💡 As fotos de perfil são públicas (leitura) mas o upload');
        console.log('   é controlado pelo backend com autenticação JWT.\n');
    }
    catch (error) {
        console.error('\n❌ ERRO:', error.message || error);
        process.exit(1);
    }
}
setupStorageAvatars();
//# sourceMappingURL=setup-storage-avatars.js.map