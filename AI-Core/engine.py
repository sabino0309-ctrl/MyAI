import sys
import json
import numpy as np
import pandas as pd
import spacy
import keras
from keras import layers
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load a lightweight linguistic parser (spaCy)
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None

def build_keras_context_model(input_dim):
    """
    Builds a lightweight neural network using Keras to score 
    context relevance and token complexity metrics on the fly.
    """
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(16, activation='relu'),
        layers.Dense(8, activation='relu'),
        layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy')
    return model

def process_ai_request(prompt):
    # 1. Use Pandas & NumPy to structure token metadata & context metrics
    prompt_tokens = prompt.split()
    df_context = pd.DataFrame({
        "token": prompt_tokens,
        "length": [len(t) for t in prompt_tokens],
        "ascii_val": [ord(t[0]) for t in prompt_tokens]
    })
    
    token_stats = {
        "total_tokens": int(len(prompt_tokens)),
        "avg_token_length": float(np.mean(df_context["length"])),
        "max_length": int(np.max(df_context["length"]))
    }

    # 2. Run Keras Neural Network Layer for context feature evaluation
    # We turn token stats into a numerical feature vector for Keras
    feature_vector = np.array([[token_stats['total_tokens'], token_stats['avg_token_length'], token_stats['max_length']]], dtype=float)
    
    # Pad feature vector to match Keras input dim if necessary, or build dynamically
    keras_model = build_keras_context_model(input_dim=3)
    neural_score = float(keras_model.predict(feature_vector, verbose=0)[0][0])

    # 3. Extract linguistic context via spaCy
    linguistic_entities = []
    if nlp:
        doc = nlp(prompt)
        linguistic_entities = [(ent.text, ent.label_) for ent in doc.ents]

    # 4. Synthesize final generated response incorporating Keras neural metrics
    response_text = (
        f"Context analyzed. Tokens: {token_stats['total_tokens']} | "
        f"Keras Neural Complexity Score: {neural_score:.4f}."
    )
    
    if linguistic_entities:
        response_text += f" Detected entities: {linguistic_entities}"

    output = {
        "status": "success",
        "stats": token_stats,
        "keras_neural_score": neural_score,
        "entities": linguistic_entities,
        "generated_response": response_text
    }
    
    print(json.dumps(output))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_prompt = sys.argv[1]
        process_ai_request(input_prompt)
    else:
        print(json.dumps({"error": "No prompt provided to AI engine"}))
