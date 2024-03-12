'use client'
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorBubbleMenu } from "@/ui/editor/components";
import { TiptapExtensions } from "@/ui/editor/extensions";
import { TiptapEditorProps } from "@/ui/editor/props";
import { useDebouncedCallback } from "use-debounce";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import va from "@vercel/analytics";
import { useGetResume } from "@/lib/hooks/useGetResume"
import { useUpdateResume } from "@/lib/hooks/useUpdateResume";
const ResumeDetails = ({ params }: {params:{ resumeId:string }}) => {

    const [resumeItem, setResumeItem] =  useState(null);
    const getResume = useGetResume();
    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const updateResume = useUpdateResume();

    const contentRef = useRef(null);

    const convertToPdf = () => {
      const content = contentRef.current;
  
      const options = {
        filename: 'my-document.pdf',
        margin: 0.5,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait',
        },
      };
  
      html2pdf().set(options).from(content).save();
    };

    async function getSingleResume(resumeId:string){
        try {
          setLoading(true)
          const { status, data } = await getResume(resumeId);
          if(status===200){
            setResumeItem(data?.data);
          }
        } catch (error) {
          console.log(error)
        }finally{
          setLoading(false)
        }
      }

    useEffect(()=>{
        getSingleResume(params?.resumeId);
    },[])

    const [content, setContent] = useState(null);

    // console.log(content, 'content:::')
    const [status, setStatus] = useState("Saved");
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (resumeItem) {
          editor?.commands.setContent(resumeItem?.content);
        }
      }, [resumeItem]);
  
    const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
      const json = editor.getHTML();
      console.log(json, 'json=== data')
      setStatus("Saving...");
      setContent(json);
      // Simulate a delay in saving.
      setTimeout(() => {
        setStatus("Saved");
        (async function(){
            try {
                console.log(content, 'to be updated')
              setLoadingUpdate(true);
              const { status, data } = await updateResume(params?.resumeId, {
                resumetitle:'Resume item here',
                content:json,
              });
              console.log(status, status);
              console.log(data, 'updated data')
            } catch (error) {
              console.log(error)
            }finally{
              setLoadingUpdate(false);
            }
          })()
      }, 1000);
    }, 750);
  
    const editor = useEditor({
      extensions: TiptapExtensions,
      editorProps: TiptapEditorProps,
      onUpdate: (e) => {
        setStatus("Unsaved");
        const selection = e.editor.state.selection;
        const lastTwo = e.editor.state.doc.textBetween(
          selection.from - 2,
          selection.from,
          "\n",
        );
        if (lastTwo === "++" && !isLoading) {
          e.editor.commands.deleteRange({
            from: selection.from - 2,
            to: selection.from,
          });
          complete(e.editor.getText());
          va.track("Autocomplete Shortcut Used");
        } else {
          debouncedUpdates(e);
        }
      },
      autofocus: "end",
    });
  
    const { complete, completion, isLoading, stop } = useCompletion({
      id: "novel",
      api: "/api/generate",
      onResponse: (response) => {
        if (response.status === 429) {
          toast.error("You have reached your request limit for the day.");
          va.track("Rate Limit Reached");
          return;
        }
      },
      onFinish: (_prompt, completion) => {
        editor?.commands.setTextSelection({
          from: editor.state.selection.from - completion.length,
          to: editor.state.selection.from,
        });
      },
      onError: () => {
        toast.error("Something went wrong.");
      },
    });
  
    useEffect(() => {
      // if user presses escape or cmd + z and it's loading,
      // stop the request, delete the completion, and insert back the "++"
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
          stop();
          if (e.key === "Escape") {
            editor?.commands.deleteRange({
              from: editor.state.selection.from - completion.length,
              to: editor.state.selection.from,
            });
          }
          editor?.commands.insertContent("++");
        }
      };
      const mousedownHandler = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        stop();
        if (window.confirm("AI writing paused. Continue?")) {
          complete(editor?.getText() || "");
        }
      };
      if (isLoading) {
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("mousedown", mousedownHandler);
      } else {
        document.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("mousedown", mousedownHandler);
      }
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("mousedown", mousedownHandler);
      };
    }, [stop, isLoading, editor, complete, completion.length]);
  
    // Insert chunks of the generated text
    const prev = useRef("");
    useEffect(() => {
      const diff = completion.slice(prev.current.length);
      prev.current = completion;
      editor?.commands.insertContent(diff, {
        parseOptions: {
          preserveWhitespace: "full",
        },
      });
    }, [isLoading, editor, completion]);
  
    // Hydrate the editor with the content from localStorage.
    useEffect(() => {
      if (editor && content && !hydrated) {
        editor.commands.setContent(content);
        setHydrated(true);
      }
    }, [editor, content, hydrated]);
    return (
        <div className="flex min-h-screen md:w-7/12 md:m-auto flex-col items-center sm:px-5 sm:pt-[calc(20vh)]">
          <button onClick={convertToPdf}>Download PDF</button>
            <div
            onClick={() => {
            // focus on text editor when click on div
            editor?.chain().focus().run();
            }}
            className="relative min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg"
        >
            <div className="absolute right-5 top-5 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400" >
            {status}
            </div>
            <EditorContent editor={editor} ref={contentRef}/>
            {editor && (
            <>
                <EditorBubbleMenu editor={editor} />
                {/* <AIBubbleMenu editor={editor} /> */}
            </>
            )}
        </div>
        </div>
    )
  }
  
  export default ResumeDetails