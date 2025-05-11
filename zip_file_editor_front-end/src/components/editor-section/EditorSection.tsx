import styles from './EditorSection.module.css';

export default function EditorSection() {

    return (
        <div className={styles.editorSection}>
            <div className={styles.editorContent}>
                <div className={styles.editorReady}>
                    파일 트리에서 파일을 선택해주세요.
                </div>
            </div>
        </div>
    );
}