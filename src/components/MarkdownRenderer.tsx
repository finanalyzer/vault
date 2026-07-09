import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // 代码块：带语法高亮
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      // 判断是否为代码块（有 language- 前缀）还是行内代码
      if (match) {
        return (
          <div className="relative group my-4">
            {/* 语言标签 */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 rounded-t-lg border-b border-gray-700">
              <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeString)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制
              </button>
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: '0.5rem',
                borderBottomRightRadius: '0.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      // 行内代码
      return (
        <code
          className="px-1.5 py-0.5 mx-0.5 rounded bg-light-200 dark:bg-dark-600 text-light-800 dark:text-light-200 font-mono text-[0.85em]"
          {...props}
        >
          {children}
        </code>
      );
    },

    // 链接：在新窗口打开
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-main hover:text-brand-darker dark:hover:text-brand-lighter underline underline-offset-2 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },

    // 图片：响应式 + 圆角
    img({ src, alt, ...props }) {
      return (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg my-4 shadow-light-2 dark:shadow-dark-2"
          loading="lazy"
          {...props}
        />
      );
    },

    // 表格：带边框和斑马纹
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-light-200 dark:divide-dark-600 border border-light-200 dark:border-dark-600 rounded-lg overflow-hidden">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return (
        <thead className="bg-light-50 dark:bg-dark-700">
          {children}
        </thead>
      );
    },
    th({ children }) {
      return (
        <th className="px-4 py-3 text-left text-xs font-semibold text-light-600 dark:text-light-300 uppercase tracking-wider">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="px-4 py-2.5 text-sm text-light-700 dark:text-light-300 border-t border-light-100 dark:border-dark-600">
          {children}
        </td>
      );
    },

    // 标题层级：带视觉区分
    h1({ children }) {
      return (
        <h1 className="text-2xl font-bold text-light-900 dark:text-light-100 mt-8 mb-4 pb-2 border-b border-light-200 dark:border-dark-600">
          {children}
        </h1>
      );
    },
    h2({ children }) {
      return (
        <h2 className="text-xl font-semibold text-light-900 dark:text-light-100 mt-6 mb-3 pb-1.5 border-b border-light-100 dark:border-dark-700">
          {children}
        </h2>
      );
    },
    h3({ children }) {
      return (
        <h3 className="text-lg font-semibold text-light-800 dark:text-light-200 mt-5 mb-2">
          {children}
        </h3>
      );
    },
    h4({ children }) {
      return (
        <h4 className="text-base font-medium text-light-700 dark:text-light-300 mt-4 mb-2">
          {children}
        </h4>
      );
    },

    // 引用块
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-brand-main pl-4 py-1 my-4 text-light-600 dark:text-light-400 italic bg-light-50 dark:bg-dark-700/50 rounded-r-lg">
          {children}
        </blockquote>
      );
    },

    // 水平分割线
    hr() {
      return <hr className="my-8 border-light-200 dark:border-dark-600" />;
    },

    // 列表
    ul({ children }) {
      return (
        <ul className="list-disc list-outside pl-6 my-3 space-y-1 text-light-700 dark:text-light-300">
          {children}
        </ul>
      );
    },
    ol({ children }) {
      return (
        <ol className="list-decimal list-outside pl-6 my-3 space-y-1 text-light-700 dark:text-light-300">
          {children}
        </ol>
      );
    },

    // 任务列表项（GFM task list）
    li({ children, className }) {
      if (className === 'task-list-item') {
        return (
          <li className="flex items-start gap-2 my-1 text-light-700 dark:text-light-300">
            {children}
          </li>
        );
      }
      return <li>{children}</li>;
    },
    input({ checked, type, ...props }) {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 h-4 w-4 rounded border-light-300 dark:border-dark-500 text-brand-main focus:ring-brand-main cursor-default"
            {...props}
          />
        );
      }
      return <input type={type} checked={checked} {...props} />;
    },

    // 段落
    p({ children }) {
      return (
        <p className="my-2 leading-7 text-light-700 dark:text-light-300">
          {children}
        </p>
      );
    },

    // 强调
    strong({ children }) {
      return (
        <strong className="font-semibold text-light-900 dark:text-light-100">
          {children}
        </strong>
      );
    },
    em({ children }) {
      return <em className="italic">{children}</em>;
    },

    // 删除线
    del({ children }) {
      return <del className="line-through text-light-400 dark:text-dark-300">{children}</del>;
    },
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert
      prose-headings:text-light-900 dark:prose-headings:text-light-100
      prose-p:text-light-700 dark:prose-p:text-light-300
      prose-li:text-light-700 dark:prose-li:text-light-300
      prose-code:text-light-800 dark:prose-code:text-light-200
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
