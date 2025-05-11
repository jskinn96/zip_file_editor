import styles from './TabSection.module.css';

export default function TabSection() {

    return (
        <div className={styles.tabsSection}>
            <div className={styles.tabsContainer}>
                <div
                    className={`${styles.tab} ${styles.activeTab}`}
                    title="테스트/파일테스트.py"
                >
                    <span className={styles.tabName}>파일테스트.py</span>
                    <span className={styles.tabPath}>테스트/파일테스트.py</span>
                    <button
                        className={styles.closeButton}
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}