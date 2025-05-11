'use client';

import { useFileStore } from '@/stores';
import styles from './TabSection.module.css';
import { hasDuplicateFilenames } from '@/utils/tabUtils';
import { useTabEvents } from '@/hooks/useTabEvents';
import { useTabManagement } from '@/hooks/useTabManagement';

export default function TabSection() {

    const openFiles = useFileStore((state) => state.openFiles);
    const currentFilePath = useFileStore((state) => state.currentFilePath);
    

    const { handleTabClick, handleCloseTab } = useTabEvents();
    useTabManagement();
    
    // 파일 이름 중복 여부 체크
    const showPaths = hasDuplicateFilenames(openFiles);

    return (
        <div className={styles.tabsSection}>
            <div className={styles.tabsContainer}>
                {openFiles.map((file) => (
                    <div
                        key={file.path}
                        className={`${styles.tab} ${currentFilePath === file.path ? styles.activeTab : ''}`}
                        onClick={() => handleTabClick(file)}
                        title={file.path}
                    >
                        <span className={styles.tabName}>{file.name}</span>
                        {showPaths && (
                            <span className={styles.tabPath}>{file.path}</span>
                        )}
                        <button 
                            className={styles.closeButton}
                            onClick={(e) => handleCloseTab(e, file.path)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}