export class GoogleDriveService {
  static async uploadFile(file: any, accessToken: string): Promise<string | null> {
    const form = new FormData();

    form.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: ['appDataFolder'],
    };

    form.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        }
      );

      const json = await response.json();
      if (json?.id) {
        return `https://drive.google.com/file/d/${json.id}/view`;
      }

      return null;
    } catch (error) {
      console.error('Drive upload error:', error);
      return null;
    }
  }
}
