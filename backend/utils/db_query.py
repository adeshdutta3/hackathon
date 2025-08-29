from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS



embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
def query_db(question: str):
    new_vs = FAISS.load_local(
        "backend/db/faiss_index",
        embeddings,
        allow_dangerous_deserialization=True
    )

    # (Document, score) tuples
    results = new_vs.similarity_search_with_score(question, k=1)

    if not results:
        return {"answer": None, "confidence": 0.0}

    doc, score = results[0]
    response = doc.metadata["response"]

    # FAISS default is L2 distance -> smaller = better
    confidence = max(0.0, min(1.0, 1 - score))

    return {"answer": response, "confidence": confidence}
