import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const BUCKET_NAME = 'comprovantes-pagamento';

async function setupPaymentProofStorage() {
  try {
    console.log('🔧 Configurando Supabase Storage para comprovantes de pagamento...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
      process.exit(1);
    }

    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Listar buckets existentes
    console.log('\n📋 Verificando buckets existentes...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      process.exit(1);
    }

    console.log(`✅ Encontrados ${buckets?.length || 0} buckets`);
    if (buckets && buckets.length > 0) {
      console.log('   Buckets:', buckets.map(b => b.name).join(', '));
    }

    // 2. Verificar se o bucket já existe
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`\n⚠️  Bucket '${BUCKET_NAME}' já existe!`);

      // Verifica configuração atual
      const { data: bucketInfo, error: getError } = await supabase.storage.getBucket(BUCKET_NAME);

      if (getError) {
        console.error('❌ Erro ao obter informações do bucket:', getError);
      } else {
        console.log('📊 Configuração atual:');
        console.log(`   - Público: ${bucketInfo.public}`);
        console.log(`   - Limite de tamanho: ${bucketInfo.file_size_limit ? (bucketInfo.file_size_limit / 1024 / 1024).toFixed(2) + 'MB' : 'Sem limite'}`);
        console.log(`   - Tipos permitidos: ${bucketInfo.allowed_mime_types?.join(', ') || 'Todos'}`);

        // Atualiza configuração se necessário
        console.log('\n🔄 Atualizando configuração do bucket...');
        const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        });

        if (updateError) {
          console.error('❌ Erro ao atualizar bucket:', updateError);
        } else {
          console.log('✅ Bucket atualizado com sucesso!');
        }
      }
    } else {
      // 3. Criar o bucket
      console.log(`\n🆕 Criando bucket '${BUCKET_NAME}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        process.exit(1);
      }

      console.log('✅ Bucket criado com sucesso!');
      console.log('📊 Configuração:');
      console.log('   - Nome:', BUCKET_NAME);
      console.log('   - Público: Sim');
      console.log('   - Limite de tamanho: 5MB');
      console.log('   - Tipos permitidos: JPG, PNG, PDF');
    }

    // 4. Testar upload
    console.log('\n🧪 Testando upload de arquivo...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'Este é um arquivo de teste para verificar o funcionamento do bucket.';

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
      });

    if (uploadError) {
      console.error('❌ Erro ao fazer upload de teste:', uploadError);
    } else {
      console.log('✅ Upload de teste realizado com sucesso!');

      // 5. Testar download
      console.log('🧪 Testando download de arquivo...');
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(testFileName);

      if (downloadError) {
        console.error('❌ Erro ao fazer download de teste:', downloadError);
      } else {
        console.log('✅ Download de teste realizado com sucesso!');
      }

      // 6. Limpar arquivo de teste
      console.log('🧹 Removendo arquivo de teste...');
      await supabase.storage.from(BUCKET_NAME).remove([testFileName]);
      console.log('✅ Arquivo de teste removido!');
    }

    console.log('\n🎉 Configuração do bucket de comprovantes de pagamento concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Execute a migração do Prisma: npx prisma migrate dev');
    console.log('   2. Reinicie o servidor de desenvolvimento');
    console.log('   3. Teste o upload de comprovantes através da API');

  } catch (error: any) {
    console.error('\n❌ Erro durante a configuração:', error.message);
    console.error('\n💡 Dicas:');
    console.error('   1. Verifique se o SUPABASE_SERVICE_ROLE_KEY está correto');
    console.error('   2. Verifique se o Supabase está acessível');
    console.error('   3. Verifique se você tem permissões de administrador no Supabase');
    process.exit(1);
  }
}

setupPaymentProofStorage();
