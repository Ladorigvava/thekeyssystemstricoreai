import streamlit as st
import router

st.set_page_config(page_title="CHADRAK SUPREME", layout="wide")

st.markdown("""
    <style>
    .stApp { background-color: #0e1117; color: #fff; }
    h1 { color: #00e676; font-family: 'Courier New'; }
    .stButton>button { background-color: #00e676; color: black; font-weight: bold; width: 100%; border: none; }
    .stButton>button:hover { background-color: #00ff88; }
    </style>
""", unsafe_allow_html=True)

st.title("👁️ CHADRAK SUPREME")
st.caption("GPT-4o | Claude 3 | Gemini 1.5")

prompt = st.text_area("Enter Command:", height=100)

if st.button("⚡ IGNITE FUSION"):
    if not prompt:
        st.warning("Input required.")
    else:
        with st.spinner("Contacting Neural Grid..."):
            c1, c2, c3 = st.columns(3)
            with c1:
                st.info(router.call_gpt4o(prompt))
            with c2:
                st.warning(router.call_claude3(prompt))
            with c3:
                st.error(router.call_gemini(prompt))
        
        st.markdown("---")
        with st.spinner("Synthesizing..."):
            # Re-call specifically for synthesis (simplified for demo stability)
            gpt_res = router.call_gpt4o(prompt)
            final = router.synthesize_results(prompt, gpt_res, "See above", "See above")
            
        st.success("SYNTHESIS COMPLETE")
        st.markdown(f"<div style='padding:20px; border:1px solid #00e676'>{final}</div>", unsafe_allow_html=True)