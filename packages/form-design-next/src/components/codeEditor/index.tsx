import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/mode-powershell';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-sh';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

// doc: https://github.com/securingsincity/react-ace/blob/master/docs/Ace.md
export default function CodeEditor(props: any) {
  return (
    <AceEditor
      theme="github"
      width="auto"
      height="auto"
      tabSize={2}
      fontSize={14}
      editorProps={{ $blockScrolling: true }}
      {...props}
    />
  );
}
