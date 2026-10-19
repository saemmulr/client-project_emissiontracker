import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, redirect, session, jsonify, make_response
import sqlite3
import csv
from io import StringIO # stores the csv file in a fake file memory stored in downloads rather than server
# import requests # ANAS used for api request in airport codes

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Connect to the SQLite database
def get_db():
    conn = sqlite3.connect("emission_database47.db")
    conn.row_factory = sqlite3.Row
    return conn


# -------------------- SAMEH'S HOME/SIGNUP ----------------------

# home page start/kick off


@app.route("/home")
@app.route("/")
def home():
    return render_template("home.html", title='Home')

# Route to open the signup page
@app.route("/signup")
def signup():
    return render_template("signup.html")

# Route to connect database with the form 

from werkzeug.security import generate_password_hash

@app.route("/signup", methods=["GET", "POST"])
def signup_user():   # <-- rename the function
    
    if request.method == "POST":
        name = request.form.get("full_name")
        email = request.form.get("email")
        dob = request.form.get("dob")
        address = request.form.get("address")
        phone = request.form.get("phone")
        town = request.form.get("town")
        password = request.form.get("password")

        # Hash the password
        hashed_password = generate_password_hash(password)

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO users (full_name, email, dob, address, phone, town, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, email, dob, address, phone, town, hashed_password))

        conn.commit()
        conn.close()

        return redirect("/")

    return render_template("signup.html")

# -------------------- END SAMEH'S HOME/SIGNUP ----------------------



# -------------------- SAMEH'S LOGIN ----------------------

from werkzeug.security import check_password_hash

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        conn = get_db()
        cursor = conn.cursor()

        user = cursor.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()

        if user is None:
            error = "No account found with that email"
            return render_template("login.html", error=error)

        # Check hashed password
        if not check_password_hash(user["password"], password):
            error = "Incorrect password"
            return render_template("login.html", error=error)

        # Login successful
        session["user_id"] = user["user_id"]
        session["name"] = user["full_name"]

        return redirect("/account_overview")

    return render_template("login.html", error=error)

@app.route("/auth_check")
def auth_check():
    if "user_id" in session:
        return redirect("/account_overview")
    return redirect("/login")



# -------------------- END SAMEH'S LOGIN ----------------------

    # Render login page (GET request or after failed POST)
    return render_template("login.html", error=error)


# Dashboard route
@app.route("/dashboard")
def dashboard():
    # Ensure only Arian T. with ID 3 can access
    if "user" not in session or session.get("user") != "full_name" or session.get("user_id") != 11:
        return redirect("/")
    

    conn = get_db()
    rows = conn.execute("SELECT * FROM emission").fetchall()  # fetch all columns
    conn.close()

    return render_template("dashboard.html", data=rows)


# -------------------- SAEMMUL'S DASHBOARD ----------------------
# ASSUMING ARIAN IS THE ADMIN WITH USER ID 14


# Your Account Overview Dashboard
@app.route("/account_overview")
def account_overview():
    if "user_id" not in session:
        return redirect("/")
    return render_template("account_overview.html")

# API to get entries for metrics
@app.route("/get_entries")
def get_entries():
    if "user_id" not in session:
        return redirect("/")
    
    user_id = session["user_id"]
    
    # Check if admin (in our fake example Arian T. is the Admin)
    admin_ids = [11]
    is_admin = user_id in admin_ids
    
    conn = get_db()
    
    if is_admin:
        rows = conn.execute("SELECT * FROM emission").fetchall()
    else:
        rows = conn.execute("SELECT * FROM emission WHERE user_id = ?", (user_id,)).fetchall()
    
    conn.close()
    
    entries = []
    for row in rows:
        entries.append({
            "entry_id": row["entry_id"],
            "user_id": row["user_id"],
            "date": row["date"],
            "name": row["name"],
            "leg_1": row["leg_1"],
            "leg_2": row["leg_2"],
            "extra_legs": row["extra_legs"],  
            "single_return": row["single_return"],
            "class": row["class"],
            "total_miles": row["total_miles"],
            "co2": row["co2"],
            "mode_of_transport": row["mode_of_transport"]
        })

    
    from flask import jsonify
    return jsonify(entries)





# ------------------- END OF SAEMMULS DASHBOARD ------------------------

# __________________________________Anas' form code start____________
# connecting database
DATABASE = 'emission_database47.db'

# get the database function
def get_db():
    conn = sqlite3.connect("emission_database47.db")   
    conn.row_factory = sqlite3.Row
    return conn


# route to submit a travel entry page
@app.route('/submit_travel_entry_page')
def submit_travel_entry_page():
    return render_template('submit_travel_entry_page.html', errors={}, form={})

# ---------------------- YASINS EDIT STARTS HERE ----------------------
# -------------------- Helper function for extra legs --------------------
def add_entry_with_extra_legs(form_data, name, user_id):
    """
    leg_1 and leg_2 stay separate.
    leg_3 – leg_6 get combined into one string and stored in extra_legs column.
    """

    # Keep leg_1 and leg_2 normal
    leg_1 = form_data.get("leg_1") or ""
    leg_2 = form_data.get("leg_2") or ""

    # Combine only legs 3–6
    extra_legs_list = []
    for i in range(3, 7):
        leg = form_data.get(f"leg_{i}")
        if leg and leg.strip():
            extra_legs_list.append(leg.strip())

    extra_legs_str = ",".join(extra_legs_list)  # Example: "LHR-JFK, JFK-LAX"

    # Other fields
    date = form_data.get("date")
    single_return = form_data.get("single_return")
    class_type = form_data.get("class")
    mode_of_transport = form_data.get("mode_of_transport")
    total_miles = form_data.get("total_miles")
    co2 = form_data.get("co2")

    try:
        conn = sqlite3.connect("emission_database47.db")
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO emission (
                date, leg_1, leg_2, extra_legs, single_return, class, 
                mode_of_transport, total_miles, co2, name, user_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            date, leg_1, leg_2, extra_legs_str, single_return, class_type,
            mode_of_transport, total_miles, co2, name, user_id
        ))

        conn.commit()

    except Exception as e:
        conn.rollback()
        print("Error adding entry with extra legs:", e)
        return str(e)

    finally:
        conn.close()

    return "Record with extra legs successfully added"
# -----------------------------------------------------------------------


#----------------------- YASINS EDIT ENDS HERE -------------------------


# entry route
@app.route('/submit_an_entry', methods=['POST'])
def submit_an_entry():

    # get data from session
    user_id = session['user_id']
    name = session['name']

    # get data from form
    date = request.form['date']
    leg_1 = request.form['leg_1']
    leg_2 = request.form['leg_2']
    single_return = request.form['single_return']
    class_type = request.form['class']
    mode_of_transport = request.form['mode_of_transport']
    total_miles = request.form['total_miles']
    co2 = request.form['co2']

# Backend validation, code is not working at the moment, if I have time I will fix
    errors = {} # errors start with no errors

# if input is empty, add an error
    if not date:
        errors['date'] = "Date is required"
    if not leg_1:
        errors['leg_1'] = "Leg 1 is required"
    if not leg_2:
        errors['leg_2'] = "Leg 2 is required"
    if not single_return:
        errors['single_return'] = "Please select single or return"
    if not class_type:
        errors['class'] = "Class is required"
    if not mode_of_transport:
        errors['mode_of_transport'] = "Mode of transport is required"
    if not total_miles:
        errors['total_miles'] = "Total miles is required"
    if not co2:
        errors['co2'] = "CO2 value is required"

    if errors: # return page with errors
        return render_template('submit_travel_entry_page.html', errors=errors, form=request.form)

    # msg = add_entry(date, leg_1, leg_2, single_return, class_type, mode_of_transport, total_miles, co2, name, user_id)
    # return msg
   
    msg = add_entry_with_extra_legs(request.form, name, user_id) # YASIN added this and commented out the old version which is not my code



# add an entry function
def add_entry(date, leg_1, leg_2, single_return, class_type, mode_of_transport, total_miles, co2, name, user_id):
    msg = "hi"

    try: # 
        conn = sqlite3.connect("emission_database47.db") # connect to db and insert into each fields
        cur = conn.cursor()
        cur.execute("""
                INSERT INTO emission (date, leg_1, leg_2, single_return, class, mode_of_transport, total_miles, co2, name, user_id)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (date, leg_1, leg_2, single_return, class_type, mode_of_transport, total_miles, co2, name, user_id))

        conn.commit()      


        msg = "Record successfully added"
    except Exception as e:
        conn.rollback()
        print(e)
        msg = str(e) # error code
    finally:
        conn.close()
    return msg

#-------------ARIAN CODE INSIDE ANAS CODE START --------------

@app.route('/calculate_miles', methods=['POST'])
def calculate_miles():
    import requests, math
    data = request.get_json()
    leg_1 = data.get("leg_1")
    leg_2 = data.get("leg_2")

    API_KEY = os.getenv("ORS_API_KEY")

    # --- Get coordinates of both airports ---
    geo_url = "https://api.openrouteservice.org/geocode/search"
    loc1 = requests.get(geo_url, params={"api_key": API_KEY, "text": leg_1}).json()
    lon1, lat1 = loc1["features"][0]["geometry"]["coordinates"]

    loc2 = requests.get(geo_url, params={"api_key": API_KEY, "text": leg_2}).json()
    lon2, lat2 = loc2["features"][0]["geometry"]["coordinates"]

    # --- Haversine formula for (air miles) ---
    def haversine(lat1, lon1, lat2, lon2):
        R = 3958.8  # Earth radius in miles

        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)

        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    miles = haversine(lat1, lon1, lat2, lon2)  # calculates the miles

    # --- Carbon calculation (example: 0.000257 metric tons per mile) ---
    co2_per_mile = 0.000257
    co2 = round(miles * co2_per_mile, 3)

    return {"miles": round(miles, 2), "co2": co2}



#--------------------- ARIAN CODE INSIDE ANAS CODE END ------------------#


# __________________________________Anas' form code end____________
 
 # -------------------- Arian code start----------------------

@app.route("/update_entry", methods=["POST"])
def update_entry():
    data = request.get_json()
    print("Received update:", data)  # <-- debug

    try:
        conn = get_db()
        conn.execute("""
            UPDATE emission SET 
                date=?, 
                leg_1=?, 
                leg_2=?, 
                single_return=?, 
                class=?, 
                mode_of_transport=?, 
                total_miles=?, 
                co2=?
            WHERE entry_id=?
        """, (
            data["date"],
            data["leg_1"],
            data["leg_2"] or "N/A",   # prevent NOT NULL error
            data["single_return"],
            data["class"],
            data["mode_of_transport"] or "Unknown",
            float(data["total_miles"]),
            float(data["co2"]),
            int(data["entry_id"])
        ))

        conn.commit()
        conn.close()
        return {"success": True}

    except Exception as e:
        print("Update failed:", e)
        return {"success": False, "error": str(e)}
    







@app.route("/delete_entry", methods=["POST"])
def delete_entry():
    data = request.get_json()
    entry_id = data.get("entry_id")

    try:
        conn = get_db()
        conn.execute("DELETE FROM emission WHERE entry_id = ?", (entry_id,))
        conn.commit()
        conn.close()
        return {"success": True}

    except Exception as e:
        print("Delete failed:", e)
        return {"success": False, "error": str(e)}




# -------------------- Arian code END----------------------












































# ------------------- Start OF SAEMMULS CSV btn ------------------------


@app.route("/download_csv")
def download_csv():
    if "user_id" not in session: # checks if anyone is logged in
        return redirect("/")
    
    user_id = session["user_id"] # gets the logged in users ID

    # if admin:
    admin_ids =[11]
    is_admin = user_id in admin_ids


    conn = get_db()
    
    if is_admin:
        rows = conn.execute("SELECT * FROM emission").fetchall() # admins csv
    else:
        rows = conn.execute("SELECT * FROM emission WHERE user_id = ?", (user_id,)).fetchall() # user's csv
    
    conn.close()

    # Create CSV in memory
    si = StringIO() #check
    writer = csv.writer(si)


    writer.writerow(['Entry ID', 'User ID', 'Date', 'Name', 'Leg 1', 'Leg 2', 'Single Return', 'Class', 'Mode of Transport', 'Total Miles', 'CO2'])
    

    for row in rows:
        writer.writerow([
            row['entry_id'],
            row['user_id'],
            row['date'],
            row['name'],
            row['leg_1'],
            row['leg_2'],
            row['single_return'],
            row['class'],
            row['mode_of_transport'],
            row['total_miles'],
            row['co2']
        ])


    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=emission_data.csv"
    output.headers["Content-type"] = "text/csv"
    
    return output

# ------------------- END OF SAEMMULS CSV btn ------------------------





@app.route("/get_line_chart_data")
def get_line_chart_data():
   if "user_id" not in session:
       return jsonify({"error": "Not logged in"}), 401
  
   user_id = session["user_id"]
   admin_ids = [11]
   is_admin = user_id in admin_ids
  
   conn = get_db()
  
   try:
       if is_admin:
           current_month = conn.execute("""
               SELECT date, SUM(co2) as total_co2
               FROM emission
               WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
               GROUP BY date
               ORDER BY date
           """).fetchall()
       else:
           current_month = conn.execute("""
               SELECT date, SUM(co2) as total_co2
               FROM emission
               WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
               AND user_id = ?
               GROUP BY date
               ORDER BY date
           """, (user_id,)).fetchall()
      
       if is_admin:
           last_month = conn.execute("""
               SELECT date, SUM(co2) as total_co2
               FROM emission
               WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month')
               GROUP BY date
               ORDER BY date
           """).fetchall()
       else:
           last_month = conn.execute("""
               SELECT date, SUM(co2) as total_co2
               FROM emission
               WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month')
               AND user_id = ?
               GROUP BY date
               ORDER BY date
           """, (user_id,)).fetchall()
      
       conn.close()
      
       current_total = sum(row['total_co2'] for row in current_month)
       last_total = sum(row['total_co2'] for row in last_month)
      
       current_data = [{"date": row["date"], "co2": float(row["total_co2"])} for row in current_month]
       last_data = [{"date": row["date"], "co2": float(row["total_co2"])} for row in last_month]
      
       return jsonify({
           "current_month": current_data,
           "last_month": last_data,
           "current_total": current_total,
           "last_total": last_total
       })
  
   except Exception as e:
       print(f"Error in line chart: {e}")
       conn.close()
       return jsonify({"error": str(e)}), 500
  




# ------------------- START OF SAEMMULS DONUT GRAPH ------------------------


@app.route("/get_donut_chart_data")
def get_donut_chart_data():
   if "user_id" not in session:
       return jsonify({"error": "Not logged in"}), 401
  
   user_id = session["user_id"]
   admin_ids = [11]
   is_admin = user_id in admin_ids
  
   conn = get_db()
  
   try:
       if is_admin:
           transport_data = conn.execute("""
               SELECT mode_of_transport, COUNT(*) as count
               FROM emission
               WHERE mode_of_transport IS NOT NULL AND mode_of_transport != ''
               GROUP BY mode_of_transport
               ORDER BY count DESC
           """).fetchall()
          
           total_entries = conn.execute("SELECT COUNT(*) as total FROM emission").fetchone()['total']
       else:
           transport_data = conn.execute("""
               SELECT mode_of_transport, COUNT(*) as count
               FROM emission
               WHERE user_id = ? AND mode_of_transport IS NOT NULL AND mode_of_transport != ''
               GROUP BY mode_of_transport
               ORDER BY count DESC
           """, (user_id,)).fetchall()
          
           total_entries = conn.execute("SELECT COUNT(*) as total FROM emission WHERE user_id = ?", (user_id,)).fetchone()['total']
      
       conn.close()
      
       transport_list = [{"transport": row["mode_of_transport"], "count": row["count"]} for row in transport_data]
      
       return jsonify({
           "transport_data": transport_list,
           "total_entries": total_entries
       })
  
   except Exception as e:
       print(f"Error in donut chart: {e}")
       conn.close()
       return jsonify({"error": str(e)}), 500






# ------------------- END OF SAEMMULS Donut graph ------------------------

































# Logout route
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)

