from pymongo import MongoClient
from flask import Flask, render_template, jsonify, request, redirect, session, url_for, flash

app = Flask(__name__)
client = MongoClient('mongodb://test:test@localhost', 27017)
# client = MongoClient('localhost', 27017)
db = client.dbhomework


@app.route('/home')
def home():
    return render_template('main.html');

@app.route('/', methods=['GET', 'POST'])
def login_1():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        userid = request.form['id_give']
        password = request.form['pw_give']
        users = db.MyUsers.find_one({'Id': userid, 'Pw': password})
        if users is None:
            flash("아이디와 비밀번호를 확인해주세요.")
        else:
            session['user'] = userid
            return redirect('home')
        return redirect('/')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/regist')
def regist():
    return render_template('regist.html')

@app.route("/logout")
def logout():
    session.pop("user")
    return redirect(url_for("home"))

@app.route('/registing', methods=['POST'])
def save_user():
    name_receive = request.form['name_give']
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']
    interest_receive = request.form['interest_give']

    doc = {'Name': name_receive,'Id': id_receive,'Pw': pw_receive,
            'Interest': interest_receive
           }
    db.MyUsers.insert_one(doc)

    return jsonify({'msg': '회원가입 완료!!'})

# 투두리스트 가져오기
@app.route('/main', methods=['GET'])
def main():
    todo_data = list(db.toDos.find({}, {'_id': False}))
    if (todo_data == None):
        return jsonify({'msg': '투두가 비었습니다.', 'result': todo_data})
    else:
        return jsonify({'result': todo_data, 'msg': "get성공"})


# 추가하기 버튼 누르면 todo datae들 post요청
@app.route('/main', methods=['POST'])
def post_todo():
    content_data = request.form['content']
    star_data = request.form['star']
    todo_id = request.form['todo_id']
    todo_check = request.form['todo_check']

    if (content_data == None or star_data == None):
        return jsonify({'msg': '값을 입력해 주세요'})
    else:
        db.toDos.insert_one(
            {'todo_id': todo_id, 'content_data': content_data, 'star_data': star_data, 'todo_check': todo_check})

        return jsonify({'msg': 'data has been inserted'})


# 투두리스트 삭제하기
@app.route('/main/delete', methods=['PUT'])
def delete_one():
    todo_id = request.form['todo_id']
    print(todo_id)
    db.toDos.delete_one({'todo_id': todo_id});

    return jsonify({'todo_id': todo_id, 'msg': '삭제됨'})

# 투두리스트 체크박스 수정(수정 중)
@app.route('/main/check', methods=['PUT'])
def update_check():
    checked = request.form['isChecked']
    targetId = request.form['targetId']
    db.toDos.update_one({"todo_id": targetId}, {"$set": {'todo_check': checked}})

    return jsonify({'msg': '수정되었습니다.'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)