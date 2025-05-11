import styles from './page.module.css';
import UploadSection from '@/components/upload-section/UploadSection';
import FileTree from '@/components/file-tree/FileTree';
import TabSection from '@/components/tab-section/TabSection';
import EditorSection from '@/components/editor-section/EditorSection';

export default function ZipFileEditor() {
    
    return (
        <div className={styles.container}>
            <div className={styles.editorContainer}>
                <UploadSection />
                <div className={styles.contentArea}>
                    <FileTree />
                    <div className={styles.mainContent}>
                        <TabSection />
                        <EditorSection />
                    </div>
                </div>
            </div>
        </div>
    );
}