<template>
    <div class="glpi-image-container">
        <h3>Image depuis GLPI</h3>
        <img v-if="imageUrl" :src="imageUrl" alt="Image GLPI" class="glpi-img" />
        <p v-else-if="loading">Chargement de l'image...</p>
        <p v-else>Impossible de charger l'image.</p>
    </div>
</template>

<script setup>
//@ts-nocheck
import { ref, onMounted } from 'vue';
import axios from 'axios';

const imageUrl = ref(null);
const loading = ref(true);

// URL de base de l'API REST
const GLPI_API_URL = '/glpi/apirest.php';
const SESSION_TOKEN = 'QTFGSllIOEJCL1RUYnlNSGg0RmtjT0djRE81Q1J3OGF2NGhpNGxJbWswVkIzbUROcklHMUFiVWMwQUtsUlpPeEpxRHNhSGZidWloKzJtOU1GVmN3WHN3aQ==';
const DOCUMENT_ID = 65; // ID de votre document GLPI

const fetchGlpiImage = async () => {
    try {
        // Ajout de "/file" à la fin de l'URL pour télécharger le contenu réel du document
        const response = await axios.get(`${GLPI_API_URL}/Document/${DOCUMENT_ID}?app_token=glpi&alt=media`, {
            headers: {
                'Accept': 'application/json',
                'Session-Token': SESSION_TOKEN
            },
            responseType: 'blob'
        });

        const imageBlob = await response.data;

        // Création de l'URL pointant vers le Blob binaire de l'image
        imageUrl.value = URL.createObjectURL(imageBlob);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image GLPI :', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchGlpiImage();
});
</script>

<style scoped>
.glpi-img {
    max-width: 100%;
    height: auto;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>