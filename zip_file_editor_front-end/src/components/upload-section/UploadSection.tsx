import styles from './UploadSection.module.css';

export default function UploadSection() {

    return (
        <div className={styles.uploadSection}>
            <div className={styles.uploadContent}>
                <input
                    type="file"
                    accept=".zip"
                    className={styles.fileInput}
                    id="fileInput"
                />
                <div className={styles.uploadControls}>
                    <label htmlFor="fileInput" className={styles.uploadButton}>
                        Upload ZIP File
                    </label>
                    <button
                        className={styles.downloadButton}
                    >
                        Download
                    </button>
                    <span className={styles.fileName}>
                        테스트.zip
                    </span>
                    <span className={styles.processingIndicator}>
                        처리 중...
                    </span>
                </div>
            </div>
        </div>
    );
}