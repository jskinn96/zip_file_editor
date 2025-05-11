import styles from './FileTree.module.css';

export default function FileTree() {

    return (
        <div className={styles.fileTree}>
            <div
                className={styles.treeContent}
            >
                <div className={styles.treeContainer}>
                    <div className={styles.treeItem}>
                        <div
                            className={styles.itemHeader}
                        >
                            <span className={styles.itemIcon}>
                                📁
                            </span>
                            <span className={styles.itemName}>테스트</span>
                            <span className={styles.expandIcon}>
                                ᐱ
                            </span>
                        </div>
                    </div>
                    <div className={styles.itemChildren}>
                        <div className={styles.treeItem}>
                            <div
                                className={styles.itemHeader}
                                style={{ paddingLeft: '16px' }}
                            >
                                <span className={styles.itemIcon}>
                                    📄
                                </span>
                                <span className={styles.itemName}>파일테스트.py</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}