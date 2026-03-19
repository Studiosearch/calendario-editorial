import React, { useState } from 'react';
import ApprovalGridView from './ApprovalGridView';
import ApprovalDetailView from './ApprovalDetailView';

export default function ApprovalPage({ posts, metadata, onBack, onApprove, onRevision }) {
    const [previewPost, setPreviewPost] = useState(null);

    if (previewPost) {
        return (
            <ApprovalDetailView
                post={previewPost}
                metadata={metadata}
                onClose={() => setPreviewPost(null)}
                onApprove={onApprove}
                onRevision={onRevision}
            />
        );
    }

    return (
        <ApprovalGridView
            posts={posts}
            metadata={metadata}
            onPostClick={setPreviewPost}
            onBack={onBack}
        />
    );
}
