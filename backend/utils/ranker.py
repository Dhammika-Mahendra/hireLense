import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def rank_resumes(job_embedding, resume_embeddings, resume_names):
    """
    job_embedding: np.array (384,)
    resume_embeddings: list of np.array
    resume_names: list of resume file names
    """

    scores = []

    for emb, name in zip(resume_embeddings, resume_names):
        score = cosine_similarity(
            job_embedding.reshape(1, -1),
            emb.reshape(1, -1)
        )[0][0]

        scores.append((name, float(score)))

    # Sort by similarity score (high → low)
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores
