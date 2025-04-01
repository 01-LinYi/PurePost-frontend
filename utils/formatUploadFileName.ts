export function formatUploadFileName(fileType: 'avatar' | 'image' | 'video', originalFileName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    const fileExtension = originalFileName.split('.').pop();
    let prefix = '';

    switch (fileType) {
        case 'avatar':
            prefix = 'avatar';
            break;
        case 'image':
            prefix = 'img';
            break;
        case 'video':
            prefix = 'vid';
            break;
        default:
            throw new Error('Invalid file type');
    }

    return `${prefix}_${timestamp}.${fileExtension}`;
}