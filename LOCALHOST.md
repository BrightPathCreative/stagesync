# Viewing StageSync on localhost

**Use port 8080 only:** open **http://localhost:8080** (not 5000).  
If you see **403 Access denied** on port 5000, or **ERR_EMPTY_RESPONSE**, follow the steps below.

## 1. Open Terminal (Mac)

- Press **Cmd+Space**, type **Terminal**, press Enter.  
- Or use **Finder → Applications → Utilities → Terminal**.

(Use your Mac’s Terminal, not only Cursor’s, so the server keeps running.)

## 2. Go to the project and start the server

Run these two commands, one after the other:

```bash
cd /Users/saralidonni/Documents/StageSync
./start-server.sh
```

You should see something like:

```
Starting server at http://localhost:8080
Open this URL in your browser: http://localhost:8080

Serving HTTP on 0.0.0.0 port 8080 ...
```

**Leave this Terminal window open.** If you close it, the server stops.

## 3. Open the site in your browser

In Chrome, Safari, or another browser, go to:

**http://localhost:8080**

The StageSync home page should load.

## 4. To stop the server

In the Terminal window where the server is running, press **Ctrl+C**.

---

**If you see 403 Access denied**

- You may be on the wrong port. Use **http://localhost:8080** (the script uses 8080, not 5000).
- Close any other server or app using port 5000, then run `./start-server.sh` and open **http://localhost:8080**.

**If it still doesn’t work**

- Make sure you use **http://** (not https).
- Try **http://127.0.0.1:8080** instead of localhost.
- If another app is using port 8080, the script will try to stop it first; if you see errors, restart your Mac and run `./start-server.sh` again.
