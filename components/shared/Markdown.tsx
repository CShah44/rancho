import React from "react";
import markdownit from "markdown-it";
import DOMPurify from "dompurify";

type Props = {
  text: string;
};

const md = markdownit();

const Markdown = ({ text }: Props) => {
  const htmlContent = md.render(text); // this needs to be purified since we are dangerously setting innerHTML, it can lead to cross-site scripting (XSS) attacks by running extra javscript code

  const sanitizedHtmlContent = DOMPurify.sanitize(htmlContent);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }}></div>;
};

export default Markdown;
