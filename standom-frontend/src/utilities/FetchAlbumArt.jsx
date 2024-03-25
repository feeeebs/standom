
export default async function FetchAlbumArtFromS3(albumArtKey) {
    try {
        const response = await fetch(`https://standom-album-art.s3.us-east-2.amazonaws.com/${albumArtKey}`);

        if (!response.ok) {
            throw new Error('Failed to fetch album art from S3');
        }

        const imageData = await response.blob();

        return imageData;
    } catch (error) {
        console.error('Error fetching album art from S3: ', error)
        return null;
    }
}
