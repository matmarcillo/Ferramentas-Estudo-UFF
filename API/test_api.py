import requests
import uuid
import os

BASE_URL = "http://localhost:8000"

def run_tests():
    print("🚀 Iniciando Testes da API (Game Analytics)...")
    print("-" * 50)

    # 1. Checando Status da API
    print("\n[1] Verificando Status da API e DB...")
    res = requests.get(f"{BASE_URL}/status")
    print(f"GET /status -> Status: {res.status_code}")
    
    res = requests.get(f"{BASE_URL}/db-status")
    print(f"GET /db-status -> {res.json() if res.status_code == 200 else res.status_code}")

    # 2. Dropdowns Globais
    print("\n[2] Buscando dados dos Dropdowns...")
    res_courses = requests.get(f"{BASE_URL}/courses")
    courses = res_courses.json() if res_courses.status_code == 200 else []
    print(f"GET /courses -> {len(courses)} cursos encontrados")
    if not courses:
        # Se não houver curso, cria um de teste
        requests.post(f"{BASE_URL}/course", json={"nome": "Engenharia de Software", "codigo": f"TCC{uuid.uuid4().hex[:4]}", "faculdade": "Computação"})
        courses = requests.get(f"{BASE_URL}/courses").json()
    
    res_professors = requests.get(f"{BASE_URL}/professors")
    professors = res_professors.json() if res_professors.status_code == 200 else []
    print(f"GET /professors -> {len(professors)} professores encontrados")
    if not professors:
        requests.post(f"{BASE_URL}/professor", json={"nome": "Prof Teste", "email": f"prof{uuid.uuid4().hex[:4]}@uff.br", "departamento": "Computação"})
        professors = requests.get(f"{BASE_URL}/professors").json()

    res_semesters = requests.get(f"{BASE_URL}/semesters")
    semesters = res_semesters.json() if res_semesters.status_code == 200 else []
    print(f"GET /semesters -> {len(semesters) if type(semesters) == list else 'erro'} semestres encontrados")
    if not semesters or type(semesters) == dict:
        requests.post(f"{BASE_URL}/semester", json={"ano": 2024, "periodo": "1"}, headers={"is-admin": "true"})
        sem_raw = requests.get(f"{BASE_URL}/semesters").json()
        semesters = sem_raw if type(sem_raw) == list else [sem_raw] if sem_raw else []

    # Guarda os IDs para referências em outros testes
    # Handles if the array is still empty due to list mapping
    course_id = courses[0].get("id") if type(courses) == list and len(courses) > 0 else 1
    professor_id = professors[0].get("id") if type(professors) == list and len(professors) > 0 else 1
    semester_id = semesters[0].get("id") if type(semesters) == list and len(semesters) > 0 else 1

    # 3. Criando um Usuário para Teste
    print("\n[3] Criando um Novo Usuário...")
    unique_id = uuid.uuid4().hex[:6]
    email = f"test_{unique_id}@uff.br"
    
    user_data = {
        "nome": f"Aluno Teste {unique_id}",
        "email": email,
        "tier": "Bronze"
    }
    res = requests.post(f"{BASE_URL}/user", json=user_data)
    print(f"POST /user -> Status {res.status_code}")

    # 4. Login e Autenticação (JWT)
    print("\n[4] Testando Auth / Login...")
    login_data = {
        "email": email,
        "password": "senha_qualquer"
    }
    res = requests.post(f"{BASE_URL}/users/login", json=login_data)
    print(f"POST /users/login -> Status {res.status_code}")
    
    if res.status_code == 200:
        token = res.json().get("access_token")
        print("\n🔑 Login bem sucedido. Pegando token para requisições seguras...")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 5. Criando um documento autenticado
        print("\n[5] Enviando um arquivo documentado (Autenticado)...")
        with open("fake_doc.txt", "w") as f:
            f.write("Apenas para testar o envio via multipart formdata")
            
        with open("fake_doc.txt", "rb") as f:
            res_doc = requests.post(
                f"{BASE_URL}/documento", 
                headers=headers,
                data={
                    "disciplina_id": course_id,
                    "semestro_id": semester_id,
                    "tipo": "prova"
                },
                files={"file": f}
            )
        print(f"POST /documento -> Status {res_doc.status_code} | Resposta: {res_doc.json()}")
        doc_id = res_doc.json().get("id") if res_doc.status_code == 200 else None
        os.remove("fake_doc.txt") # limpa o arquivo no lado do client

        # 6. Avaliando Disciplina e Professor
        print("\n[6] Enviando avaliações...")
        res_aval_d = requests.post(
            f"{BASE_URL}/avaliacao/disciplina",
            headers=headers,
            json={"disciplina_id": course_id, "semestre_id": semester_id, "nota": 4.5, "comentario": "Bom"}
        )
        print(f"POST /avaliacao/disciplina -> Status {res_aval_d.status_code}")
        
        res_aval_p = requests.post(
            f"{BASE_URL}/avaliacao/professor",
            headers=headers,
            json={"professor_id": professor_id, "semestre_id": semester_id, "nota": 4.0, "comentario": "Didático"}
        )
        print(f"POST /avaliacao/professor -> Status {res_aval_p.status_code}")

        # 7. Comentário em documento
        if doc_id:
            print(f"\n[7] Adicionando comentário no documento {doc_id}...")
            res_coment = requests.post(
                f"{BASE_URL}/{course_id}/documentos/{doc_id}/comentario",
                headers=headers,
                json={"documento_id": doc_id, "texto": "Ótimo documento!", "replies_to_id": None}
            )
            print(f"POST /comentario -> Status {res_coment.status_code}")

            print(f"\n[8] Votando no documento {doc_id} (Deveria dar erro pois somos os donos)...")
            res_voto = requests.post(
                f"{BASE_URL}/{course_id}/documentos/{doc_id}/voto",
                headers=headers,
                json={"documento_id": doc_id, "valor": 1}
            )
            # Vai retornar 400 bad request pois a API proibe votar no seu proprio documento
            print(f"POST /voto -> Status {res_voto.status_code} | Resposta: {res_voto.json()}")

        # 9. Fetch /users/me history
        print("\n[9] Buscando Perfil e Histórico (/users/me)...")
        res = requests.get(f"{BASE_URL}/users/me", headers=headers)
        print(f"GET /users/me -> Status {res.status_code}")
        
        if res.status_code == 200:
            me_data = res.json()
            print(f"- Nome: {me_data.get('nome')}")
            print(f"- Exp: {me_data.get('exp')}")
            print(f"- Tier: {me_data.get('tier')}")
            print(f"- Uploads de Documentos: {len(me_data.get('documentos', []))}")
            print(f"- Avaliações de Classes: {len(me_data.get('avaliacoes_disciplina', []))}")
            print(f"- Avaliações de Professores: {len(me_data.get('avaliacoes_professor', []))}")
    else:
        print("❌ Login falhou. Impossível testar endpoints seguros.")
    
    print("\n" + "-" * 50)
    print("✅ Fim dos Testes!")

if __name__ == "__main__":
    # Garante que o usuário tem um app rodando para ser testado
    try:
        requests.get(BASE_URL)
        run_tests()
    except requests.exceptions.ConnectionError:
        print(f"❌ ERRO: A API em {BASE_URL} não fpi encontrada.")
        print("Certifique-se de iniciar a API rodando: uvicorn main:app --reload")