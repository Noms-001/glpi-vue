// @ts-nocheck
import JSZip from 'jszip'
import { apiRequest } from '../api/http-client'

export default class ImageManager {

    static supportedExtensions = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        bmp: 'image/bmp'
    }

    /**
     * @param {File} zipFile
     */
    static async cleanImages(zipFile, onLog) {

        if(!zipFile) return []

        onLog('📦 Extraction des images...')

        const images = []
        const zip = await JSZip.loadAsync(zipFile)

        const entries = Object.entries(zip.files)

        await Promise.all(
            entries.map(async ([fullPath, entry]) => {

                if (entry.dir) return

                let fileName = fullPath.split('/').pop()

                if (!fileName) return
                if (fileName.startsWith('_')) return
                if (fileName.startsWith('.')) return

                const blob = await entry.async('blob')


                const mimeType = await this.detectFileType(blob)
                const ext = mimeType.split('/').pop()

                if (!ext) return
                if (!this.supportedExtensions[ext]) return

                const cleanName = fileName.replace(/\.[^/.]+$/, '')

                fileName = `${cleanName}.${ext}`

                const file = new File(
                    [blob],
                    fileName,
                    {
                        type: mimeType
                    }
                )


                images.push({
                    name: cleanName,
                    filename: fileName,
                    file,
                    ext
                })
            })
        )

        onLog(`📷 ${images.length} images trouvées`)

        return images
    }

    static async detectFileType(file) {
        const buffer = await file.slice(0, 32).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);

        const magicMatch = (start, signature) => {
            for (let i = 0; i < signature.length; i++) {
                if (bytes[start + i] !== signature[i]) return false;
            }
            return true;
        };

        if (magicMatch(0, [0x89, 0x50, 0x4E, 0x47])) return 'image/png';

        if (magicMatch(0, [0xFF, 0xD8, 0xFF])) return 'image/jpeg';

        if (magicMatch(0, [0x47, 0x49, 0x46])) return 'image/gif';

        if (magicMatch(0, [0x52, 0x49, 0x46, 0x46]) && magicMatch(8, [0x57, 0x45, 0x42, 0x50])) {
            return 'image/webp';
        }

        if (magicMatch(0, [0x42, 0x4D])) return 'image/bmp';

        if (magicMatch(0, [0x49, 0x49, 0x2A, 0x00])) return 'image/tiff';
        if (magicMatch(0, [0x4D, 0x4D, 0x00, 0x2A])) return 'image/tiff';

        if (magicMatch(0, [0x00, 0x00, 0x01, 0x00])) return 'image/x-icon';

        if (magicMatch(4, [0x66, 0x74, 0x79, 0x70]) &&
            (magicMatch(8, [0x61, 0x76, 0x69, 0x66]) || magicMatch(8, [0x61, 0x76, 0x69, 0x73]))) {
            return 'image/avif';
        }

        if (magicMatch(4, [0x66, 0x74, 0x79, 0x70]) &&
            (magicMatch(8, [0x68, 0x65, 0x69, 0x63]) || magicMatch(8, [0x68, 0x65, 0x69, 0x78]) ||
                magicMatch(8, [0x6D, 0x69, 0x66, 0x31]) || magicMatch(8, [0x6D, 0x73, 0x66, 0x31]))) {
            return 'image/heic';
        }

        if (magicMatch(0, [0xFF, 0x0A]) || magicMatch(0, [0x00, 0x00, 0x00, 0x0C, 0x4A, 0x58, 0x4C, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
            return 'image/jxl';
        }

        const startText = new TextDecoder().decode(buffer.slice(0, 20));
        if (startText.includes('<svg') || startText.includes('<?xml')) {
            if (startText.match(/<svg\s|<svg>/i) || startText.match(/<!\s*DOCTYPE\s+svg/i)) {
                return 'image/svg+xml';
            }
        }

        if (magicMatch(0, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';

        return 'unknown';
    }

    /**
     * @param {Map<string, {id:number, type:string}>} assetMap
     */
    static async import(assetMap, zipFile, onLog) {

        const images = await this.cleanImages(zipFile, onLog)

        let success = 0
        let fail = 0

        for (const img of images) {

            const asset = assetMap.get(img.name)

            if (!asset) {
                onLog(`❌ Asset introuvable: ${img.name}`)
                fail++
                continue
            }

            try {

                const formData = new FormData()

                formData.append(
                    'uploadManifest',
                    JSON.stringify({
                        input: {
                            name: img.name,
                            filename: img.filename
                        }
                    })
                )

                formData.append(
                    'filename[0]',
                    img.file,
                    img.filename
                )

                const uploadResponse = await apiRequest('/Document', {
                    method: 'POST',
                    body: formData,
                    json: false
                })

                const documentId = uploadResponse.id

                if (!documentId) {
                    throw new Error(
                        uploadResponse?.message ||
                        'Document non créé'
                    )
                }

                await apiRequest('/Document_Item', {
                    method: 'POST',
                    body: {
                        input: {
                            documents_id: documentId,
                            itemtype: asset.type,
                            items_id: asset.id
                        }
                    }
                })

                onLog(`✅ Image importée: ${img.name}`)
                success++

            } catch (err) {

                console.error(err)

                onLog(
                    `❌ Erreur ${img.name}: ${err?.message || 'Erreur inconnue'
                    }`
                )

                fail++
            }
        }

        onLog(
            `🎉 Import terminé : ${success} OK / ${fail} erreurs`
        )
    }
}