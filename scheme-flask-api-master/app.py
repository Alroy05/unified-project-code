from flask import Flask, request, jsonify, render_template
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_query = request.form.get('question')
    url = request.form.get('url')
    if user_query and url:
        # Load documents
        loader = WebBaseLoader([url])
        data = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
        docs = text_splitter.split_documents(data)

        # Set up vector store
        GOOGLE_API_KEY = "AIzaSyBx0w4hpmvA8SwKxP1wxfcJt2VUin1aq1o"
        vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        )

        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

        # Set up LLM
        groq_api_key = "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"
        llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama-3.1-8b-instant")

        # System prompt and chain
        system_prompt = (
            "You are an assistant for question-answering tasks. "
            "Use the following pieces of retrieved context to answer "
            "the question. If you don't know the answer, say that you "
            "don't know. Use three sentences maximum and keep the "
            "answer concise."
            "\n\n"
            "{context}"
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        )

        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        response = rag_chain.invoke({"input": user_query})
        return jsonify({"answer": response["answer"]})
    else:
        return jsonify({"error": "No question or URL provided"}), 400

# if __name__ == '__main__':
#     app.run(debug=True)