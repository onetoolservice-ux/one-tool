declare module 'lodash.debounce';
// Manual declaration for react-quill since @types/react-quill failed to install
declare module 'react-quill' {
    import React from 'react';
    export interface ReactQuillProps {
        theme?: string;
        value?: string;
        defaultValue?: string;
        onChange?: (value: string, delta: any, source: string, editor: any) => void;
        className?: string;
        placeholder?: string;
        modules?: any;
        formats?: string[];
        readOnly?: boolean;
        children?: React.ReactNode;
    }
    const ReactQuill: React.ForwardRefExoticComponent<ReactQuillProps & React.RefAttributes<any>>;
    export default ReactQuill;
}
