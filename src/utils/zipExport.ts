import JSZip from 'jszip';
import { ProjectFile } from '../types';

export async function exportProjectAsZip(
  files: ProjectFile[],
  projectName = 'omnicode-studio-project'
): Promise<{ success: boolean; filename: string }> {
  try {
    const zip = new JSZip();

    // Iterate through all files and add to zip
    for (const file of files) {
      // Normalize path
      const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      zip.file(filePath, file.content);
    }

    // Generate package.json if not present
    if (!files.some((f) => f.name === 'package.json')) {
      const packageJson = {
        name: projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        version: '1.0.0',
        private: true,
        description: 'Exported from OmniCode Studio AI Workspace',
        scripts: {
          start: 'npx serve .',
        },
      };
      zip.file('package.json', JSON.stringify(packageJson, null, 2));
    }

    // Generate blob
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const downloadFilename = `${projectName}-${timestamp}.zip`;

    // Trigger download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename: downloadFilename };
  } catch (error) {
    console.error('Failed to export zip:', error);
    throw error;
  }
}
